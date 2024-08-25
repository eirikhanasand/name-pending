import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import storedEmbeds from "../../managed/roles.js";
import config from '../../utils/config.js';
export const data = new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Handles roles')
    .addStringOption((option) => option
    .setName('title')
    .setDescription('Header'))
    .addStringOption((option) => option
    .setName('description')
    .setDescription('Subheader'))
    .addStringOption((option) => option
    .setName('roles')
    .setDescription('IDs of the role(s) to add seperated by space'))
    .addStringOption((option) => option
    .setName('icons')
    .setDescription('Icons to display to the left of each role'));
export async function execute(message) {
    // Checking if the author is allowed to setup services
    const isAllowed = message.member?.roles?.cache.some((role) => role.id === config.roleID);
    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply("Unauthorized.");
    }
    const title = message.options.getString('title');
    if (!title) {
        return await message.reply('Missing title');
    }
    const name = message.options.getString('description');
    if (!name) {
        return await message.reply('Missing description');
    }
    const roleString = message.options.getString('roles');
    if (!roleString) {
        return await message.reply('Missing roles');
    }
    const roleIconsString = message.options.getString('icons');
    if (!roleIconsString) {
        return await message.reply('Missing icons');
    }
    const roles = Array.from(roleString.trim().split(' '));
    const roleIcons = Array.from(roleIconsString.trim().split(' '));
    roleIcons.forEach((icon) => {
        let name = '';
        const match = icon.match(/<:(.*):[0-9]+>/);
        if (match) {
            name = match[1];
        }
        const options = message.options;
        const params = options._hoistedOptions.map((param) => `${param.name}:${param.value}`);
        const input = `/roles ${params.join(' ')}`;
        if (!isValidEmoji(icon) && !name.length) {
            return message.reply({
                content: `There is no emoji named \`\`${name || icon}\`\`\ \nYou entered: \`\`\`text\n${input}\`\`\``,
                ephemeral: true
            });
        }
    });
    const value = roles.map((role, index) => `${roleIcons[index] ? roleIcons[index] : '❓'} <@&${role}>`).join('\n');
    const guild = message.guild;
    if (!guild) {
        return await message.reply('Guild unavailable.');
    }
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor("#fd8738")
        .setTimestamp()
        .addFields({ name, value });
    const response = await message.reply({ embeds: [embed], fetchReply: true });
    storedEmbeds.push({ "channelID": message.channelId, "message": response.id });
    for (let i = 0; i < roleIcons.length; i++) {
        response.react(roleIcons[i]);
    }
    const responseCollector = response.createReactionCollector({
        filter: (_, user) => !user.bot,
        dispose: true
    });
    responseCollector.on('collect', async (reaction, user) => {
        const member = await guild.members.fetch(user.id);
        for (let i = 0; i < roleIcons.length; i++) {
            const pattern = /<:(\w+):/;
            const match = pattern.exec(roleIcons[i]);
            if (match && match[1] === reaction._emoji.name) {
                member.roles.add(roles[i]);
                break;
            }
            else if (roleIcons[i] === reaction._emoji.name) {
                member.roles.add(roles[i]);
                break;
            }
        }
    });
    responseCollector.on('remove', async (reaction, user) => {
        const member = await guild.members.fetch(user.id);
        for (let i = 0; i < roleIcons.length; i++) {
            const pattern = /<:(\w+):/;
            const match = pattern.exec(roleIcons[i]);
            if (match && match[1] === reaction._emoji.name) {
                member.roles.remove(roles[i]);
                break;
            }
            else if (roleIcons[i] === reaction._emoji.name) {
                member.roles.remove(roles[i]);
                break;
            }
        }
    });
}
function isValidEmoji(emoji) {
    const validEmojiRegex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])|[\u2600-\u27FF\u2B50\u2934\u2935\u2B06\u2194\u2195\u25AA\u25AB\u25FE\u25FD\u25FC\u25B6\u25C0\u23E9\u23EA\u23F8\u23F9\u23FA\u25B6\u25C0⛏️]$/;
    return validEmojiRegex.test(emoji);
}
