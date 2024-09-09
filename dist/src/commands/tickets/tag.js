import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName('tag-ticket')
    .setDescription('Tags a ticket with a topic')
    .addStringOption((option) => option
    .setName('topic')
    .setDescription('Topic to tag the ticket with'));
export async function execute(message) {
    const topic = message.options.getString('topic');
    if (!topic) {
        await message.reply({ content: "You need to specify a topic to tag the ticket with", ephemeral: true });
        return;
    }
    tag(message, topic);
}
async function tag(message, topic) {
    // Tagger ticketen med noe i beskrivelsen
    await message.reply({ content: `Tagged ticket with 🏷️ ${topic}` });
}
