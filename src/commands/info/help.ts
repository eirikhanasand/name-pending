import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js'
import getCommand, { getButtons } from '#utils/help.ts'

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help for the bots messages')
    .addStringOption((option) => option
        .setName('command')
        .setDescription('Command in question')
    )
    .addBooleanOption((option) => option
        .setName('display')
        .setDescription('Display the message')
    )
export async function execute(message: ChatInputCommandInteraction) {
    const command = message.options.getString('command')
    const display = message.options.getBoolean('display')

    await help(message, command, display)
}

async function help(message: ChatInputCommandInteraction, command: string | null, display: boolean | null) {
    let page = 0
    
    const embed = getCommand(command || undefined, page)
    
    const components = command ? undefined : getButtons(page)
    await message.reply({ 
        embeds: [embed], 
        components,
        ephemeral: display ? false : true
    })
}
