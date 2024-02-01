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

    console.log("1")
    const regex = /\d+/;

    const channelName = message.options.getString('export-channel')
    const channelMatch = channelName.match(regex)

    if (!channelMatch) {
        console.log("No match for channel-name.")
        return
    }

    let exportChannel = message.guild.channels.cache.find(channel => channel.id === channelMatch[0])

    if (!exportChannel) {
        return message.reply('The export-channel channel does not exist.')
    }

    const loggingChannelName = message.options.getString('logging-channel')
    const loggingMatch = loggingChannelName.match(regex)

    if (!loggingMatch) {
        console.log("No match for logging-channel-name.")
        return
    }
    let loggingChannel = message.guild.channels.cache.find(channel => channel.id === loggingMatch[0])

    if (!loggingChannel) {
        return message.reply('The logging-channel channel does not exist.')
    }

    const roleName = message.options.getString('role')
    const match = roleName.match(regex)

    if (!match) {
        console.log("No match for role-name.")
        return
    }
    message.guild.roles.cache.forEach(entry => {
         if (entry.id == match[0]) console.log("role : " + entry.name)
    })

    const role = message.guild.roles.cache.find(role => role.id === match[0])

    const filter = msg => msg.member.roles.cache.find(r => r.id == role.id)

    const collector = exportChannel.createMessageCollector(
        {filter}
    )
    collector.on('collect', m => {
        loggingChannel.send(m.author.globalName + " : ")

        if (!(m.content == "")) {
            loggingChannel.send(m.content)
        }
        const allowedFileSize = 50 * 1024 * 1024; // 50 MB

        m.attachments.forEach(attach => {
            let size = attach.size

            if (size < allowedFileSize) {
                loggingChannel.send({
                    files: [attach.attachment]
                })
            } else {
                loggingChannel.send(attach.attachment)
            }
        })
    })

    // Setup success message
     message.editReply(`Now mirroring from ${exportChannel.name} to ${loggingChannel.name} for role ${role.name}.`)
}