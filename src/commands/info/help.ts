import { 
    SlashCommandBuilder, 
    ChatInputCommandInteraction, 
    ButtonBuilder, 
    ButtonStyle, 
    ActionRowBuilder, 
    ComponentType
} from 'discord.js'
import getCommand from '../../utils/help.js'
import pages from '../../utils/commands.js'

export const data = new SlashCommandBuilder()
    .setName('help2')
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
    const reply = await message.reply({ 
        embeds: [embed], 
        components,
        ephemeral: display ? false : true
    })

    const collector = reply.createMessageComponentCollector({ 
        componentType: ComponentType.Button,
        time: 300000
    })

    collector.on('collect', async (interaction) => {
        if (interaction.customId === 'previous_page_help') {
            if (page === 0) return
            page--
        } else if (interaction.customId === 'next_page_help') {
            if (page === pages.length) return
            page++
        }

        const embed = getCommand(command || undefined, page)
        await interaction.update({ embeds: [embed], components: getButtons(page) })
    })
}

function getButtons(page: number) {
    const previous = new ButtonBuilder()
        .setCustomId('previous_page_help')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary)

    const next = new ButtonBuilder()
        .setCustomId('next_page_help')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary)

    const buttons = new ActionRowBuilder<ButtonBuilder>()

    if (page > 0 && page < pages.length - 1) {
        buttons.addComponents(previous, next)
    } else if (page > 0) {
        buttons.addComponents(previous)
    } else if (page < pages.length) {
        buttons.addComponents(next)
    }

    return [buttons]
}
