import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonInteraction, 
    ButtonStyle, 
    Embed, 
    EmbedBuilder, 
    EmbedField 
} from "discord.js"
import pages from "./commands.js"

const commands = {
    chat: "Establishes a link between the current channel and the Minecraft survival and creative servers. Use the command by typing the following: `/chat`. The link will be established automatically.",
    syntax: "`/help command:name`\n",
    info: "Displays info about the bot. Use the command by typing the following: `/info`",
    ping: "Pings the bot. The bot replies 'Pong!' if online. Use the command by typing the following: `/ping`",
    setup: [
        {name: "Setup", value: "Sets up the specified chat service. Use the command by typing the following: `/setup service:name`"},
        {name: "Available services", value: " "},
        {name: "chat", value: "Sets up a chat service that mirrors in game messages from your severs to Discord, and mirrors the Discord chat to in game."},
    ],
    version: "Displays the bots version number. Use the command by typing the following: `/version`",
    name: "'name' is a placeholder, please replace it with the command you want help for. For example for help on the ping command, write `/help command:ping`",
} as {[key: string]: string | {name: string, value: string}[]}

export default function getEmbed(command: string | undefined, page: number = 0) {
    if (command === 'name') {
        return createEmbed("Help", "Displays how to use the command specified", [{name: `Showing page ${page + 1} / ${pages.length}`, value: commands["name"] as string, inline: false}])
    }

    if (command === undefined) {
        return createEmbed("Help", "Displays how to use the command specified", [{name: `Showing page ${page + 1} / ${pages.length}`, value: getPage(page).join('\n'), inline: false}])
    }

    if (commands[command] === undefined) {
        return createEmbed("Help", "Displays how to use the command specified", [{name: "Invalid command", value: pages[0].join('\n'), inline: false}])
    }
    
    if (Array.isArray(commands[command])) {
        return createEmbed("Help", `Help for **${command}**`, commands[command] as EmbedField[])
    }

    return createEmbed("Help", `Help for **${command}**`, [{name: command, value: commands[command] as string, inline: false}])
}

function createEmbed(title: string, description: string, fields: EmbedField[]) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor("#fd8738")
        .setTimestamp()
    
        for (const field of fields) {
            embed.addFields({
                name: field.name,
                value: field.value,
                inline: field.inline ? field.inline : false,
            })
    }

    return embed
}

function getPage(page: number) {
    return pages[page]
}

export function getButtons(page: number) {
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
    } else if (page < pages.length && pages.length > 1) {
        buttons.addComponents(next)
    } else {
        return []
    }

    return [buttons]
}

export async function nextPage(interaction: ButtonInteraction) {
    // Fetches the current page from the message
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0])
    const previousPage = page + 1

    // Fetches new content
    const newEmbed = getEmbed(undefined, previousPage)
    const newButtons = getButtons(previousPage)

    // Updates the message
    await interaction.update({ embeds: [newEmbed], components: newButtons })
}

export async function previousPage(interaction: ButtonInteraction) {
    // Fetches the current page from the message
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0])
    const previousPage = page - 1

    // Fetches new content
    const newEmbed = getEmbed(undefined, previousPage)
    const newButtons = getButtons(previousPage)

    // Updates the message
    await interaction.update({ embeds: [newEmbed], components: newButtons })
}

function extractPageNumberFromEmbed(embed: Embed): number {
    const pageField = embed.data.fields?.find(field => field.name.startsWith('Showing page'))
    if (pageField) {
        const match = pageField.name.match(/Showing page (\d+) \/ \d+/)
        if (match && match[1]) {
            // Converts 1-based page to 0-based and returns it
            return parseInt(match[1], 10) - 1
        }
    }

    // Defaults to the first page if no match is found
    return 0
}
