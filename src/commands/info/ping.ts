import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('pingeling')
    .setDescription('Replies with Pong!')
export async function execute(message: ChatInputCommandInteraction) {
    await message.reply('Pong!')
}
