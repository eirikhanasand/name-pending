import { Client, Message, TextChannel } from 'discord.js'
import http from "http"
import { Reaction } from 'discord.js'
import config from './config.js'

export default async function connectToMinecraft(client: Client) {
    // Filter to check that the author is not a bot to prevent an infinite loop
    const filter = (response: Message) => !response.author.bot

    // Message collector that collects all messages written in Discord
    const guild = client.guilds.cache.get(config.guildId)

    if (!guild) {
        return console.error("Guild is undefined.")
    }

    const channel = await guild.channels.fetch(config.channelId) as TextChannel
    const collector = channel.createMessageCollector({ filter })
    
    // Seperate collector that listens to reactions on all messages
    const botMessageCollector = channel.createMessageCollector()
    
    collector?.on('collect', (m: Message) => {
        post(`${m.author.username || m.author.globalName || m.author.id}: ${m.content}`)
    })
    
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
 * Posts the message from Discord on all servers
 */
function post(message: string) {
    config.minecraft_servers.forEach((server) => {
        fetch(`https://${server.url}/${server.name}-message`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: message
        })
    })
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
    // Runs once per 5 minutes as long as the chat is being mirrored
    while (true) {
        let prod = [] as string[]
        let dev = [] as string[]
        const maxWidth = 20
        let players = ""
        let topic = ""

        await Promise.allSettled(config.minecraft_servers.map(async(server) => {
            const response = await fetch(`https://${server.url}/${server.name}-online`)
            const data = await response.json()

            switch (server.name) {
                case config.minecraft_servers[0].name: prod = data; break
                case config.minecraft_servers[1].name: dev = data; break
            }
        }))

        let playersProd = prod.length
        let playersDev = dev.length

        for (let i = 0; i < Math.max(playersProd, playersDev); i++) {
            const playerProd = (prod[i] || "").substring(0, maxWidth)
            const playerDev = (dev[i] || "").substring(0, maxWidth)
            
            const spacesProd = "\t".repeat(Math.max(0, (maxWidth - playerProd.length) / 4))
            const spacesDev = "\t".repeat(Math.max(0, (maxWidth - playerDev.length) / 4))
        
            const tabs = Math.max(1, Math.floor((maxWidth - playerProd.length) / 4))
            const tabCharacters = "\t".repeat(tabs)

            players += `${playerProd}${spacesProd}${tabCharacters}${playerDev}${spacesDev}\n`
        }

        const online = prod.length + dev.length
        const name = config.minecraft_servers[0].name

        if (online) {
            topic = `${name}. Online: ${online}\n${name} (${prod.length})\t\t\t\t   Dev (${dev.length})\n${players}`
        } else {
            topic = `${name}. There are no players online at this time.`
        }
        
        if (channel && 'setTopic' in channel) {
            channel?.setTopic(topic)
        } else {
            console.error("Failed to set topic in minecraft/chat.ts")
        }

        // Waits for 5 minutes (Discord rate limit)
        await new Promise(resolve => setTimeout(resolve, 300000))
    }
}
