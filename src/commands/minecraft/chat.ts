import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import connectToMinecraft from '../../utils/connectToMinecraft.js'

export const data = new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Establishes a connection between Minecraft and this Discord chat')

export async function execute(message: ChatInputCommandInteraction<CacheType>) {    
    // Checks that the channel is valid
    if (!message.channel || !message.channel?.isTextBased()) {
        return await message.reply({content: 'This command can only be used in text channels.', ephemeral: true})
    }
    
    await message.reply({content: 'Establishing connection...', ephemeral: true, fetchReply: true})

    connectToMinecraft(message)
}
