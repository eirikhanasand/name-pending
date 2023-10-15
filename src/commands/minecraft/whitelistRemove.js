import { SlashCommandBuilder } from 'discord.js'
import pty from 'node-pty'
import config from "../../../config.json" assert {type: "json"}

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('whitelist_remove')
    .setDescription('Removes a user from the Minecraft whitelist!')
    .addStringOption((option) => option
        .setName('user')
        .setDescription('User to remove')
    )

/**
 * Executes the whitelist command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message) {
    // Slices to avoid overflow errors
    const user = message.options.getString('user').slice(0, 30)

    // Checking if the author is allowed to remove users from the whitelist
    const isAllowed = message.member.roles.cache.some(role => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({content: "Unauthorized.", ephemeral: true})
    }

    // Sends initial reply
    await message.reply({content: "Removing from whitelist...", ephemeral: true})

    // Sanitizes user before removing them to protect against xml attacks
    whitelistRemove(message, user.replace(/[^a-zA-Z0-9\s]/g, ''))
}

/**
 * Removes the selected user on the Minecraft server if possible
 * @param {*} message Message object from Discord
 * @param {*} user User to whitelist
 */
function whitelistRemove(message, user) {
    // Spawns a terminal for the survival server and removes the user from the whitelist
    spawnTerminal(message, user, "liveSurvival")
    
    // Spawns a terminal for the creative server and removes the user from the whitelist
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

    // Logs into Ludens with responsible account on the Minecraft servexr
    virtualTerminal.write(config.minecraft_command + '\r')

    // Listens for data indicating success
    virtualTerminal.onData((data) => {
        // Listens for message indicating that a connection has been established
        if (data.includes('System restart required')) {
            // Exexcutes the whitelist action in the tmux session
            virtualTerminal.write(`tmux send-keys -t ${session} 'whitelist remove ${user}' C-m\r`)

            // Enters the session to listen for response of whitelist action
            virtualTerminal.write(`tmux attach-session -t ${session}\r`)    
        }

        // Listens for message indicating success
        if (data.includes(`Removed ${user.slice(0, 1).toUpperCase() + user.slice(1)} from the whitelist`)) {
            message.editReply(`Removed ${user} from the whitelist`)
            log(message, user, `Removed ${user} from the ${session} whitelist`)
            virtualTerminal.kill()
            alive = false

        // Listens for message indicating that the player is not whitelisted
        } else if (data.includes('Player is not whitelisted')) {
            message.editReply(`${user} is not whitelisted`)
            log(message, user, `${user} is not whitelisted on ${session}`)
            virtualTerminal.kill()
            alive = false

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
 * Logs the status of a whitelist_remove message to the log channel
 * @param {*} message Message object from Discord
 * @param {*} user Author of the message
 * @param {*} status Status of the request
 */
function log(message, user, status) {
    const guild = message.guild
    const logChannel = guild.channels.cache.get(config.minecraft_log)

    if (logChannel) {
        // Sends a message to the target channel
        logChannel.send(`${message.member.nickname} (ID: ${message.user.id}, Username: ${message.user.username}) authored: /whitelist_remove user:${user}, with result: ${status}`)
    } else {
        // Logs it in the terminal if no channel is set
        console.log(`${message.member.nickname} (ID: ${message.user.id}, Username: ${message.user.username}) authored: /whitelist_remove user:${user}, with result: ${status}`)
    }
}
