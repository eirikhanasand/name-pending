import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Help for the bots messages')
    .addStringOption((option) => option
        .setName('command')
        .setDescription('Command in question')
    )
export async function execute(message) {
    const command = message.options.getString('command')

    await help(message, command)
}

async function help(message, command) {
    let embed = new EmbedBuilder()
    
    switch(command) {
        case "history": {
            const fields = [
                {name: "History", value: "Displays history about the bot. Use the command by typing the following: `/history`"}
            ]
            embed = createEmbed("Help", "Help for **history**", fields)
            break
        }
        case "info": {
            const fields = [
                {name: "Info", value: "Displays info about the bot. Use the command by typing the following: `/info`"}
            ]
            embed = createEmbed("Help", "Help for **info**", fields)
            break
        }
        case "ping": {
            const fields = [
                {name: "Ping", value: "Pings the bot. The bot replies 'Pong!' if online. Use the command by typing the following: `/ping`"}
            ]
            embed = createEmbed("Help", "Help for **ping**", fields)
            break
        }
        case "registry": {
            const fields = [
                {name: "Registry", value: "Displays how to interact with Logins gitlab registry. Use the command by typing the following: `/registry`"}
            ]
            embed = createEmbed("Help", "Help for **registry**", fields)
            break
        }
        case "restart": {
            const fields = [
                {name: "Restart", value: "Restarts the specified service. Use the command by typing the following: `/restart service:name`"}
            ]
            embed = createEmbed("Help", "Help for **restart**", fields)
            break
        }
        case "setup": {
            const fields = [
                {name: "Setup", value: "Sets up the specified service. Use the command by typing the following: `/setup service:name`"},
                {name: "Available services", value: " "},
                {name: "chat", value: "Sets up a chat service that mirrors in game messages from both the creative and survival server to Discord, and mirrors the Discord server to in game."},
                {name: "log", value: "Logs the whitelist messages in the chat where the command was sent."},
                {name: "chat stop mirror", value: "Stops the bot from mirroring in game messages to Discord"},
                {name: "chat stop listener", value: "Stops the bot from mirroring Discord messages to in game"},
                {name: "chat stop", value: "Stops the chat service altogether."},
            ]
            embed = createEmbed("Help", "Help for **setup**", fields)
            break
        }
        case "whitelist": {
            const fields = [
                {name: "Whitelist", value: "Whitelists the user specified. Use the command by typing the following: `/whitelist user:name`"}
            ]
            embed = createEmbed("Help", "Help for **whitelist**", fields)
            break
        }
        case "whitelist_remove": {
            const fields = [
                {name: "whitelist_remove", value: "Removes the specified user from the whitelist. Use the command by typing the following: `/whitelist_remove user:name`"}
            ]
            embed = createEmbed("Help", "Help for **whitelist_remove**", fields)
            break
        }
        case "archive": {
            const fields = [
                {name: "archive", value: "Archives Logins digital footprint to webarchive. Currently unstable. Use the command by typing the following: `/archive`"}
            ]
            embed = createEmbed("Help", "Help for **archive**", fields)
            break
        }
        case "status": {
            const fields = [
                {name: "status", value: "Displays websites ready to be archived. Currently unstable. Use the command by typing the following: `/status`"}
            ]
            embed = createEmbed("Help", "Help for **status**", fields)
            break
        }
        case "name": {
            const fields = [
                {name: "Name", value: "'name' is a placeholder, please replace it with the command you want help for. For example for help on the ping command, write `/help command:ping`"}
            ]
            embed = createEmbed("Help", "Help for **help**", fields)
            break
        }
        case "help": {
            const fields = [
                {name: "Syntax", value: "`/help command:name`\n"}
            ]
            embed = createEmbed("Help", "Help for **help**", fields)
            break
        }
        default: {
            // The invisible character is used as Discord removes multiple spaces and tabs in the output
            const values = [
                "The command name provided is not available. ",
                "Available commands are:",
                "help                                    Help for the help command",
                "history                               History of the Discord bot",
                "ping                                    Pings the bot",
                "registry                              Help for how to use the registry",
                "restart                               Restarts the specified services",
                "setup                                 Sets up the specified service",
                "whitelist                            Whitelists the specified user",
                "whitelist_remove           Removes the specified user from the whitelist",
                "archive                              Archives Logins digital footprint to the webarchive",
                "status                                Displays domains ready to be archived"
            ]
            const fields = [
                {name: "Invalid command", value: values.join('\n')}
            ]
            embed = createEmbed("Help", "Displays how to use the command specified", fields)
        }
    }

    await message.reply({ embeds: [embed]})
}

function createEmbed(title, description, fields) {

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
