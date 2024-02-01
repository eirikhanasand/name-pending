import config from "../../../config.json" assert {type: "json"}
import { SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('mirror')
    .setDescription('Sets up the logging functionally from an export-channel to a designated logging-channel.')
    .addStringOption((option) => option
        .setName('export-channel')
        .setDescription('Channel for the messages to be logged from.')
    )
    .addStringOption((option) => option
        .setName('logging-channel')
        .setDescription('Channel for logs to be sent.')
    )
    .addStringOption((option) => option
        .setName('role')
        .setDescription('Role of the logged-individuals.')
    )

export async function execute(message) {
    await message.reply({content: "Building mirror...", ephemeral: true })

    const isAllowed = message.member.roles.cache.some(role => role.id === config.roleID)

    if (!isAllowed) {
        return message.reply("Unauthorized.")
    }

    const channelName = message.options.getString('export-channel')
    let exportChannel = message.guild.channels.fetch(channelName)

    if (!exportChannel) {
        return message.reply('The export-channel channel does not exist.')
    }

    const loggingChannelName = message.options.getString('logging-channel')
    let loggingChannel = message.guild.channels.fetch(loggingChannelName)

    if (!loggingChannel) {
        return message.reply('The logging-channel channel does not exist.')
    }

    const roleName = message.options.getString('role')
    const role = message.guild.roles.fetch(roleName)

    const collector = exportChannel.createMessageCollector(
        { filter: (message) => message.member.roles.cache.some(r => r.id === role.id)}
    )

    collector.on('collect', m => {
        loggingChannel.postMessage(m)
    })

    // Setup success message
    // message.editReply(`Now mirroring from ${channelName} to ${loggingChannel} for role ${roleName}.`)
}