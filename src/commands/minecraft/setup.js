import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import pty from 'node-pty'
import config from "../../../config.json" assert {type: "json"}
let mirrorSurvival = ""
let mirrorCreative = ""
let listenSurvival = ""
let listenCreative = ""
const survivalSession = "liveSurvival"
const creativeSession = "liveCreative"

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Sets up a service in the selected channel.')
    .addStringOption((option) => option
        .setName('service')
        .setDescription('Service to setup')
    )

/**
 * Executes the setup command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message) {
    const service = message.options.getString('service')
    const embed = new EmbedBuilder()
    .setTitle("Setting up service")
    .setDescription("Sets up a service of your choice")
    .setColor("#fd8738")
    .setTimestamp()
    .addFields(
        {name: "Status", value: "Starting...", inline: true},
    )

    // Checking if the author is allowed to setup services
    const isAllowed = message.member.roles.cache.some(role => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply("Unauthorized.")
    }

    // Sends the initial reply to the author only
    await message.reply({ embeds: [embed], ephemeral: true })

    // Sets up the selected service
    await setup(message, service)
}

/**
 * Calls the corresponding service
 * @param {*} message Initial message object
 * @param {*} service Service to setup
 */
async function setup(message, service) {
    switch (service) {
        case "chat": {
            setupChatMirror(message)
            setupChatListener(message)
            return
        }
        default: reply(message, "Failed, invalid service", service); return
    }
}

/**
 * Mirrors the Minecraft chat
 * @param {*} message Message object from Discord
 */
function setupChatMirror(message) {
    // Creates a virtual terminal to mirror messages from the survival in game chat to Discord
    mirrorChat(message, survivalSession)

    // Creates a virtual terminal to mirror messages from the creative in game chat to Discord
    mirrorChat(message, creativeSession)
}

/**
 * Listens for messages in the Discord chat and logs them to the console.
 * @param {*} message Initial message object 
 */
function setupChatListener(message) {
    // Creates a virtual terminal to send messages from Discord on the survival server
    createVirtualTerminal(message, survivalSession)

    // Creates a virtual terminal to send messages from Discord on the creative server
    createVirtualTerminal(message, creativeSession)
}

/**
 * Replies to the message with a custom status
 * 
 * @param {ChatInputCommandInteraction<CacheType>} message message to reply to
 * @param {string} status Status message
 * @param {string} service Service to setup
 * @returns {void} Updates the message and returns void when done
 */
async function reply(message, status, service) {
    const embed = new EmbedBuilder()
    .setTitle("Setup")
    .setDescription("Setting up service")
    .setColor("#fd8738")
    .setTimestamp()
    .addFields(
        {name: "Status", value: status, inline: true},
        {name: "Service", value: service, inline: true}
    )

    // Edits the initial bot reply
    await message.editReply({ embeds: [embed] })
}

/**
 * Creates a virtual terminal, enters it and uses tmux send-keys to send
 * messages inside of the server session
 * @param {*} message Initial message object
 * @param {string} session Session to create a terminal for
 */
function createVirtualTerminal(message, session) {
    // Spawns a virtual terminal
    const virtualTerminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    })

    // Sets the terminal to not alive if it was not spawned
    if (!virtualTerminal) {
        updateChatStatus(message, "Failed to start virtual terminal. Aborted.", session, "virtualTerminal")
    } else {
        updateChatStatus(message, "Started virtual terminal.", session, "virtualTerminal")
    }

    // Checks that the author is not a bot to prevent an infinite loop
    const filter = (response) => !response.author.bot

    // Creates a message collector that collects all messages written in Discord
    const collector = message.channel.createMessageCollector({ filter })

    // Creates a seperate collector that listens to reactions on all messages
    const botMessageCollector = message.channel.createMessageCollector()

    // Logs into Ludens with responsible account on the Minecraft server
    virtualTerminal.write(config.minecraft_command + '\r')
    updateChatStatus(message, "Entering ludens", session, "virtualTerminal")

    // Listens for data indicating success
    virtualTerminal.onData((data) => {
        // Listens for message indicating that a connection has been established
        if (data.includes('System restart required')) {
            updateChatStatus(message, "Success", session, "virtualTerminal")

            // Sends the collected messages in the in game chat
            collector.on('collect', m => {
                virtualTerminal.write(`tmux send-keys -t ${session} 'say ${m.author.username}: ${m.content}' C-m\r`)
            })

            // Sets up a collector for reactions
            botMessageCollector.on('collect', m => {
                // Listens for reactions for 30 seconds on each message
                const reactionCollector = m.createReactionCollector({ time: 30000 })

                // Logs the reaction interaction in game
                reactionCollector.on('collect', (reaction, user) => {
                    virtualTerminal.write(`tmux send-keys -t ${session} 'say ${user.tag} reacted with ${reaction.emoji.name} on ${m.content}' C-m\r`)
                })
            })
        }
    })
}

/**
 * Mirrors the in game chat from the passed session to the Discord chat
 * @param {*} message Initial message object
 * @param {string} session Minecraft session to mirror
 */
function mirrorChat(message, session) {
    let previousLines = []
    let ignoredInitial = false

    // Spawns a virtual terminal
    const virtualTerminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    })

    // Sets the terminal to not alive if it was not spawned
    if (!virtualTerminal) {
        updateChatStatus(message, "Failed to start virtual terminal. Aborted.", session, "mirrorChat")
    } else {
        updateChatStatus(message, "Started virtual terminal", session, "mirrorChat")
    }

    // Logs into Ludens with responsible account on the Minecraft server
    virtualTerminal.write(config.minecraft_command + '\r')
    updateChatStatus(message, "Entering ludens", session, "mirrorChat")

    // Listens for data indicating success
    virtualTerminal.onData((data) => {
        // Listens for message indicating that a connection has been established
        if (data.includes('System restart required')) {
            updateChatStatus(message, "Success", session, "mirrorChat")
            virtualTerminal.write(`tmux attach-session -t ${session}\r`)
        }

        // Listens for message indicating success
        if (data.includes(`INFO]`)) {

            // Splits response into lines when encountering a newline character
            const lines = data.split('\n')

            // Loops through lines
            for (const line of lines) {
                // Ignores lines sent before the bot started
                if (!ignoredInitial) {
                    previousLines.push(line)
                }

                // Checks if content is new, not empty and a chat message
                if (line.trim() !== '' && !previousLines.includes(line) && line.includes('<')) {
                    // Checks and removes discord ping and date object
                    const first = line.slice(16).replace(/@/g,'')

                    // Checks and removes terminal buffer
                    const sanitized = first.includes("[K") ? first.slice(0, first.length - 4) : first

                    // Checks if first character is correct
                    if (sanitized.trim()[0] === '<' && sanitized.includes('>')) {
                        // Replaces with Discord format Name: instead of <Name>
                        message.channel.send(sanitized.replace('<', '').replace('>', ':'))

                        // Sends the same message on the other server
                        sayOnServer(session === survivalSession ? creativeSession : survivalSession, sanitized)

                        // Pushes line to previously sent content
                        previousLines.push(sanitized)

                    // Fixes incorrect first character
                    } else if (sanitized.slice(3).trim()[0] === '<' && sanitized.includes('>')){
                        // Replaces with Discord format Name: instead of <Name>
                        message.channel.send(sanitized.slice(3).replace('<', '').replace('>', ':'))

                        // Sends the same message on the other server
                        sayOnServer(session === survivalSession ? creativeSession : survivalSession, sanitized)

                        // Pushes line to previously sent content
                        previousLines.push(sanitized)
                    }

                    // Adds line to array of already sent lines to prevent loop
                    previousLines.push(line)
                }
            }
        }

        // Checks if the initial response has been ignored
        if (!ignoredInitial) {
            updateChatStatus(message, "Waiting 5 seconds to verify tasks...")
            // Sets a timeout for 5 seconds to ignore any messages sent before the bot started
            setTimeout(() => {
                // Initial response has now been ignored, and the status is successful
                ignoredInitial = true
                updateChatStatus(message, "Success")
            }, 5000)
        }
    })
}

/**
 * Updates the status of the selected session based on the job its running
 * @param {*} message 
 * @param {string} status 
 * @param {string} session 
 * @param {string} job 
 */
async function updateChatStatus(message, status, session, job) {
    const embed = new EmbedBuilder()
    .setTitle("Setup")
    .setDescription("Setting up service")
    .setColor("#fd8738")
    .setTimestamp()
    .addFields(
        {name: "Status", value: status, inline: true},
        {name: "Mirror survival", value: mirrorSurvival ? mirrorSurvival : "Starting...", inline: true},
        {name: "Mirror creative", value: mirrorCreative ? mirrorCreative : "Starting...", inline: true},
        {name: " ", value: " ", inline: false},
        {name: "Service", value: "chat", inline: true},
        {name: "Post survival", value: listenSurvival ? listenSurvival : "Starting...", inline: true},
        {name: "Post creative", value: listenCreative ? listenSurvival : "Starting...", inline: true}
    )

    // Checks what job is updating its status
    switch (job) {
        case "mirrorChat": {
            // Checks what session was running the job
            switch (session) {
                // Updates the relevant status
                case survivalSession: mirrorSurvival = status; break
                case creativeSession: mirrorCreative = status; break
            }
        }

        case "virtualTerminal": {
            // Checks what session was running the job
            switch (session) {
                // Updates the relevant status
                case survivalSession: listenSurvival = status; break
                case creativeSession: listenCreative = status; break
            }
        }
    }

    // Sends the updated status
    await message.editReply({ embeds: [embed] })
}

/**
 * Sends a message from server A on server B
 * Has to be seperate since the tmux session is attached to mirror messages.
 * @param {*} message Initial message object
 * @param {*} user Author of the message to send
 * @param {*} session Session to send the message in
 */
function sayOnServer(session, content) {
    // Spawns a virtual terminal
    const virtualTerminal = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env
    })

    // Logs into Ludens with responsible account on the Minecraft server
    virtualTerminal.write(config.minecraft_command + '\r')

    // Listens for data indicating success
    virtualTerminal.onData((data) => {
        // Listens for message indicating that a connection has been established
        if (data.includes('System restart required')) {
            // Sends the message on the other server
            virtualTerminal.write(`tmux send-keys -t ${session} 'say ${content}' C-m\r`)

            // Closes the temporary terminal
            virtualTerminal.kill()
        }
    })
}
