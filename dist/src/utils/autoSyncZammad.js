import dotenv from 'dotenv';
import { ticketIdPattern } from "../../constants.js";
import postMessage from "./tickets/postMessage.js";
import fetchTicket from "./ticket.js";
import closeChannel from './tickets/closeChannel.js';
import getAttachment from './tickets/getAttachment.js';
import { AttachmentBuilder, ChannelType } from "discord.js";
dotenv.config();
const { DISCORD_GUILD_ID } = process.env;
export default async function autoSyncZammad(client) {
    setInterval(() => {
        sync(client);
    }, 30000);
}
async function sync(client) {
    const guild = await client.guilds.fetch(DISCORD_GUILD_ID);
    const ticketsCategory = guild.channels.cache.find(channel => channel.type ===
        ChannelType.GuildCategory
        && channel.name.toLowerCase() === 'tickets');
    if (!ticketsCategory) {
        console.log('Tickets category not found');
        return;
    }
    // Finds all channels in the 'tickets' category
    const ticketChannels = guild.channels.cache.filter(channel => channel.parentId === ticketsCategory.id
        && !channel.name.includes('ticket')
        && ticketIdPattern.test(channel.name));
    for (const ch of ticketChannels) {
        const channel = ch[1];
        const messages = await channel.messages.fetch();
        const discordMessages = messages.map(message => ({
            user: message.author.username,
            content: message.content,
            attachments: message.attachments.map((attachment) => {
                return {
                    name: attachment.name,
                    url: attachment.url
                };
            })
        }));
        const zammadMessages = await fetchTicket(Number(channel.name));
        // Checks if any are closed in Zammad, and if so closes them on Discord
        if ('error' in zammadMessages && zammadMessages.error === 'closed') {
            // Closes the Discord channel
            await closeChannel({ guild, currentChannel: channel });
            continue;
        }
        if (!Array.isArray(zammadMessages)) {
            return;
        }
        const { missingDiscord, missingZammad } = compare(discordMessages, zammadMessages);
        if (missingDiscord.length) {
            // Posts the missing message to Discord
            for (const message of missingDiscord) {
                const attachmentsToSend = [];
                for (const attachment of message.attachments) {
                    const response = await getAttachment(attachment.url);
                    if (!('attachment' in response)) {
                        continue;
                    }
                    const buffer = Buffer.from(response.attachment, 'base64');
                    const discordAttachment = new AttachmentBuilder(buffer, { name: attachment.name });
                    attachmentsToSend.push(discordAttachment);
                }
                channel.send({
                    content: `From ${message.user} via Zammad:\n\n${message.content}`.slice(0, 2000),
                    files: attachmentsToSend
                });
            }
        }
        if (missingZammad.length) {
            // Posts the missing message to Zammad
            for (const message of missingZammad) {
                postMessage(Number(channel.name), message, `From ${message.user} via Discord:\n\n${message.content}`);
            }
        }
    }
}
function compare(discordMessages, zammadMessages) {
    // Relevant messages for further checks, passed simple checks like author
    // will be further checked for content and formatted
    const relevantDiscord = [];
    const relevantZammad = [];
    // Messages that are actually missing on Discord or Zammad, passed content
    // comparing checks
    const missingDiscord = [];
    const missingZammad = [];
    // Finds messages from Discord that are relevant for further checking
    for (const message of discordMessages) {
        // Removes messages created by tekkom-bot
        if (message.user !== 'discord-bot' && message.user !== 'tekkom-bot') {
            relevantDiscord.push(message);
        }
    }
    // Finds messages from Zammad that are relevant for further checking
    for (const message of zammadMessages) {
        // Removes messages created by the tekkom bot or with an inappropriate 
        // username length (impossible unless system message)
        if (!message.user.includes('tekkom-bot') && !message.user.includes('discord-bot') && message.user.length > 1) {
            // Formats message for further checks and pushes it
            const fmt = zammadFormat(message.content);
            const via = message.user.indexOf('via Support') - 1;
            relevantZammad.push({
                user: message.user.slice(0, via).trim(),
                content: fmt,
                attachments: message.attachments
            });
        }
    }
    // Cross checks Discord messages with Zammad messages to find unsynchronized ones
    for (const message of relevantDiscord) {
        let exists = false;
        for (const zammadMessage of zammadMessages) {
            if (zammadMessage.content === message.content
                || (zammadMessage.content.includes(message.content)
                    && zammadMessage.content.includes('via Discord:'))) {
                exists = true;
            }
        }
        if (!exists) {
            missingZammad.push(message);
        }
    }
    // Cross checks Zammad messages with Discord messages to find unsynchronized ones
    for (const message of relevantZammad) {
        let exists = false;
        const normalized = normalize(message.content);
        for (const discordMessage of discordMessages) {
            const normalizedDiscord = normalize(discordMessage.content);
            const checkableDiscord = normalizedDiscord;
            if (checkableDiscord === normalized
                || (checkableDiscord.includes(normalized)
                    && checkableDiscord.includes('via zammad:'))) {
                exists = true;
            }
        }
        if (!exists) {
            missingDiscord.push(message);
        }
    }
    return { missingZammad, missingDiscord };
}
// Removes html elements from Zammad messages (automatically added by Zammad)
function zammadFormat(content) {
    const stop = content.indexOf('<div><blockquote type="cite"');
    const slicedContent = content.slice(0, stop);
    const addLineBreaks = slicedContent.replaceAll(/<\/div><div>/g, '\n');
    const lineBreaks = addLineBreaks.replaceAll(/<br>/g, '\n');
    const sanitize = lineBreaks.replaceAll(/<.*?>/g, '');
    const removeExcessLineBreaks = sanitize.replaceAll(/\n\n/g, '\n');
    const removeExcessSpace = removeExcessLineBreaks.replaceAll(/^[ ]+/gm, '');
    return removeExcessSpace;
}
function normalize(content) {
    // Replaces, trims and lowercase because Zammad uses \r instead of \n, and
    // in case of non trivial syntax errors where the content appears identical
    // to the end user
    return content.replace(/\s+/g, ' ').trim().toLowerCase();
}
