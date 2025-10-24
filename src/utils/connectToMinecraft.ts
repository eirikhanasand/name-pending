import type { Client, Message, TextChannel, Reaction } from 'discord.js'
import http from "http"
import config from '#config'
import post from '#utils/post.ts'

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
        const userAgent = req.headers['user-agent']
        const isJava = userAgent?.toLowerCase().includes('java') || false

        if (!isJava) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Unauthorized' }));
        }

        if (req.headers['type'] === 'death') {
            req.on('data', chunk => {
                channel.send(`**${chunk.toString()}**`)
            })
        } else {
            req.on('data', chunk => {
                 const data = chunk.toString()
                if (!/^([^:]+):([^:]+)$/.test(data)) {
                    res.writeHead(401, { 'Content-Type': 'application/json' })
                    return res.end(JSON.stringify({ error: 'Unauthorized' }))
                }

                channel.send(chunk.toString())
                res.writeHead(200, { 'Content-Type': 'text/plain' })
                return res.end('OK')
            })
        }
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
        let prod: string[] = []
        let topic = ""

        const response = await fetch(`${url}/${name}-online`)
        const data = await response.text()
        prod = JSON.parse(data)
        const players = prod.join(', ')
        const online = prod.length

        if (online) {
            topic = `${name.replaceAll('-', ' ')}. Online: ${players} (${online})`
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
