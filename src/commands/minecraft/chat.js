import { SlashCommandBuilder } from 'discord.js'
import http from "http"
const url = "http://51.222.254.125"
const port = 6969
const servers = [{port: 6677, name: 'survival'}, {port: 6688, name: 'creative'}]

export const data = new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Establishes a connection between Minecraft and this Discord chat')

export async function execute(message) {
    await message.reply({content: 'Connection established!', ephemeral: true});

    // Filter to check that the author is not a bot to prevent an infinite loop
    const filter = (response) => !response.author.bot

    // Message collector that collects all messages written in Discord
    const collector = message.channel.createMessageCollector({ filter })

    // Seperate collector that listens to reactions on all messages
    const botMessageCollector = message.channel.createMessageCollector()

    collector.on('collect', m => {
        post(`${m.author.username || m.author.globalName || m.author.id}: ${m.content}`)
    })

    botMessageCollector.on('collect', m => {
        // Listens for reactions for 1 minute on each message
        const reactionCollector = m.createReactionCollector({ time: 60000 })

        // Logs the reaction interaction in game
        reactionCollector.on('collect', (reaction, user) => {
            post(`${user.tag} reacted with ${reaction.emoji.name}`)
        })
    })

    listen(message)
}

/**
 * Posts the message from Discord on all servers
 * @param {Discord_Message} message 
 */
function post(message) {
    servers.forEach((server) => {
        fetch(`${url}:${server.port}/${server.name}-message`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: message
        })
    })
}

/**
 * Listens for content from Minecraft and posts it on Discord
 * @param {Discord_Message} message 
 */
async function listen(message) {
    const server = http.createServer((req) => {
        req.on('data', chunk => {
            message.channel.send(chunk.toString())
        })
    })

    server.listen(port)
}
