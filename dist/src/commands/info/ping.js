import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
    .setName('pingeling')
    .setDescription('Replies with Pong!');
export async function execute(message) {
    await message.reply('Pong!');
}
