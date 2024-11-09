import { EmbedBuilder } from "discord.js";
import { ticketIdPattern } from "../../../constants.js";
import postMessage from "./postMessage.js";
export default async function handleTickets({ matches, message }) {
    const channel = message.channel;
    const ticketChannel = ticketIdPattern.test(channel.name);
    const ticketID = Number(channel.name);
    if (matches && matches.length && message.author.username !== 'tekkom-bot') {
        let string = "###";
        for (const match of matches) {
            string += ` [${match}](https://zammad.login.no/#ticket/zoom/${match.slice(1)})`;
        }
        const embed = new EmbedBuilder()
            .setDescription(string)
            .setColor("#fd8738");
        return await channel.send({ embeds: [embed] });
    }
    if (ticketChannel) {
        if (!message.content.includes('tekkom-bot')
            && !message.content.includes('via Zammad')
            && !message.content.includes('via Discord')
            && !message.content.includes('has been created')) {
            postMessage(ticketID, message, undefined);
        }
    }
}
