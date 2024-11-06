import { ticketIdPattern } from "../../../constants.js";
import postMessage from "./postMessage.js";
export default async function handleTickets({ matches, message }) {
    const channel = message.channel;
    const ticketChannel = ticketIdPattern.test(channel.name);
    const ticketID = Number(channel.name);
    if (matches && matches.length) {
        return channel.send(`[${matches[0]}](https://zammad.login.no/#ticket/zoom/${matches[0]})`);
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
