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
    // Slices to avoid overflow errors
    const user = message.options.getString('user').slice(0, 30)
    await message.reply("Adding to whitelist...")

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
            virtualTerminal.kill()
            alive = false

        // Listens for message indicating that the player has already been whitelisted
        } else if (alive && data.includes('Player is already whitelisted')) {
            message.editReply("Player is already whitelisted")
            alive = false
            virtualTerminal.kill()

        // Listens for message indicating that the player does not exist
        } else if (alive && data.includes('That player does not exist')) {
            message.editReply(`Player ${user} does not exist`)
            virtualTerminal.kill()
            alive = false
        }
    })
}
