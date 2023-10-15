import { SlashCommandBuilder } from 'discord.js'
import pty from 'node-pty'
import config from "../../../config.json" assert {type: "json"}

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('whitelist')
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
    whitelist(message, user.replace(/[^a-zA-Z0-9\s]/g, ''))
}

/**
 * Whitelists the passed user on the Minecraft server if possible
 * @param {*} message Message object from Discord
 * @param {*} user User to whitelist
 */
function whitelist(message, user) {
    // Spawns a terminal for the survival server and whitelists the user
    spawnTerminal(message, user, "liveSurvival")
    
    // Spawns a terminal for the creative server and whitelists the user
    spawnTerminal(message, user, "liveCreative")
}

function spawnTerminal(message, user, session) {
    let alive = true

    // Spawns a virtual terminal
    const virtualTerminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    })

    // Adds a timeout to kill the terminal after 10 seconds if something went wrong
    setTimeout(() => {
        if (alive) {
            message.editReply('Failed with unknown cause. Please try again.')
            virtualTerminal.kill()
        }
    }, 20000)

    // Sets the terminal to not alive if it was not spawned
    if (!virtualTerminal) {
        alive = false
    }

    // Logs into Ludens with responsible account on the Minecraft server
    virtualTerminal.write(config.minecraft_command + '\r')

    // Listens for data indicating success
    virtualTerminal.onData((data) => {
        // Listens for message indicating that a connection has been established
        if (data.includes('System restart required')) {
            // Exexcutes the whitelist action in the tmux session
            virtualTerminal.write(`tmux send-keys -t ${session} 'whitelist add ${user}' C-m\r`)

            // Enters the session to listen for response of whitelist action
            virtualTerminal.write(`tmux attach-session -t ${session}\r`)    
        }

        // Listens for message indicating success
        if (data.includes(`Added ${user.slice(0,1).toUpperCase() + user.slice(1)} to the whitelist`)) {
            message.editReply(`Added ${user} to the whitelist`)
            log(message, user, `Added ${user} to the whitelist on ${session}`)
            virtualTerminal.kill()
            alive = false

        // Listens for message indicating that the player has already been whitelisted
        } else if (alive && data.includes('Player is already whitelisted')) {
            message.editReply(`${user} is already whitelisted`)
            log(message, user, `${user} is already whitelisted on ${session}`)
            alive = false
            virtualTerminal.kill()

        // Listens for message indicating that the player does not exist
        } else if (alive && data.includes('That player does not exist')) {
            message.editReply(`Player ${user} does not exist`)
            log(message, user, `Player ${user} does not exist on ${session}`)
            virtualTerminal.kill()
            alive = false
        }
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
