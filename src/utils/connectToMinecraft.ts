import { Client, Message, TextChannel } from 'discord.js'
import http from "http"
import { Reaction } from 'discord.js'
import config from './config.js'
import post from './post.js'

export default async function connectToMinecraft(client: Client) {
    // Message collector that collects all messages written in Discord
    const guild = client.guilds.cache.get(config.guildId)

    if (!guild) {
        return console.error("Guild is undefined.")
    }

    const channel = await guild.channels.fetch(config.channelId) as TextChannel
    
    // Seperate collector that listens to reactions on all messages
    const botMessageCollector = channel.createMessageCollector()
    
    botMessageCollector?.on('collect', (m: Message) => {
        // Listens for reactions for 1 minute on each message
        const reactionCollector = m.createReactionCollector({ time: 60000 })
        
        // Logs the reaction interaction in game
        reactionCollector.on('collect', (reaction: Reaction, user) => {
            post(`${user.tag} reacted with ${reaction._emoji.name}`)
        })
    })

    updatePlayerCount(channel)
    listen(channel)
}

/**
 * Listens for content from Minecraft and posts it on Discord
 */
async function listen(channel: TextChannel) {
    const server = http.createServer((req, res) => {
        if (req.headers['type'] === 'death') {
            req.on('data', chunk => {
                channel.send(`**${chunk.toString()}**`)
            })
        } else {
            req.on('data', chunk => {
                channel.send(chunk.toString())
            })
        }

        res.writeHead(200, { 'Content-Type': 'text/plain' })
        res.end('OK')
    })

    server.listen(config.minecraft_port)
}

/**
 * Updates the channel description of the channel tracking the Minecraft 
 * chats with the player counts.
 */
async function updatePlayerCount(channel: TextChannel) {
    const name = config.minecraft_server_name
    const url = config.minecraft_server_url
    // Runs once per 5 minutes as long as the chat is being mirrored
    while (true) {
        let prod = ""
        const maxWidth = 20
        let players = ""
        let topic = ""

        const response = await fetch(`${url}/${name}-online`)
        const data = await response.text()
        prod = data;

        let playersProd = prod.length

        for (let i = 0; i < playersProd; i++) {
            const playerProd = (prod[i] || "").substring(0, maxWidth)
            const spacesProd = "\t".repeat(Math.max(0, (maxWidth - playerProd.length) / 4))
            const tabs = Math.max(1, Math.floor((maxWidth - playerProd.length) / 4))
            const tabCharacters = "\t".repeat(tabs)

            players += `${playerProd}${spacesProd}${tabCharacters}\n`
        }

        const online = Array.from(prod).length

        if (online) {
            topic = `${name.replaceAll('-', ' ')}. Online: ${online}\n${players} (${prod.length})`
        } else {
            topic = `${name.replaceAll('-', ' ')}. There are no players online at this time.`
        }
        
        if (channel && 'setTopic' in channel) {
            channel?.setTopic(topic)
        } else {
            console.error("Failed to set topic in server chat.")
        }

        // Waits for 5 minutes (Discord rate limit)
        await new Promise(resolve => setTimeout(resolve, 300000))
    }
}
