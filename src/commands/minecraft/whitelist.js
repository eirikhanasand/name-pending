import { SlashCommandBuilder } from 'discord.js'
import config from "../../../config.json" assert {type: "json"}
const url = "http://51.222.254.125"

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('whitelistl')
    .setDescription('Whitelists a user on the Minecraft server!')
    .addStringOption((option) => option
        .setName('user')
        .setDescription('User to whitelist')
    )

/**
 * Executes the whitelist command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message) {
    // Slices to avoid overflow errors, checks to avoid passing undefined parameters
    const user = message.options.getString('user') ? message.options.getString('user').slice(0, 30) : null

    if (!user) {
        await message.reply({content: "You must provide a user: `/whitelist user:name`", ephemeral: true})
        return
    }

    await message.reply({content: "Adding to whitelist...", ephemeral: true})

    // Sanitizes user before adding them to protect against xml attacks
    console.log("posting")
    post(user.replace(/[^a-zA-Z0-9\s]/g, ''))
}

function post(name) {
    const servers = [{port: 6677, name: 'survival'}, {port: 6688, name: 'creative'}]
    servers.forEach(async(server) => {
        console.log("Whitelisting on " + server.name)
        fetch(`${url}:${server.port}/${server.name}-whitelist`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', name, action: "add"}
        })
        const response = await fetch(`${url}:${server.port}/${server.name}-whitelist`)

        console.log(response)
        log(message, user, status)
    })
}

/**
 * Logs the status of a whitelist message to the log channel
 * @param {*} message Message object from Discord
 * @param {*} user Author of the message
 * @param {*} status Status of the request
 */
function log(message, user, status) {
    const guild = message.guild
    const logChannel = guild.channels.cache.get(config.minecraft_log)

    if (logChannel) {
        // Sends a message to the target channel
        logChannel.send(`${message.member.nickname} (ID: ${message.user.id}, Username: ${message.user.username}) authored: /whitelist user:${user}, with result: ${status}`)
    } else {
        // Logs it in the terminal if no channel is set
        console.log(`${message.member.nickname} (ID: ${message.user.id}, Username: ${message.user.username}) authored: /whitelist user:${user}, with result: ${status}`)
    }
}
