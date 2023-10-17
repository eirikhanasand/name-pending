import { EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import pty from 'node-pty'
import config from "../../../config.json" assert {type: "json"}
import { exec } from 'child_process'

// State of each mirror and listener
let mirrorSurvival = ""
let mirrorCreative = ""
let listenSurvival = ""
let listenCreative = ""

// Tmux sessions monitored
const survivalSession = "liveSurvival"
const creativeSession = "liveCreative"

// Tracks if mirrors and listeners should be enabled or disabled
let killMirror = true
let killListener = true

// Players online on each server
let playersSurvival = 0
let playersCreative = 0

// Time since players online was checked
let listTimeSurvival = new Date()
let listTimeCreative = new Date()

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Manages channel specific services.')
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
            updatePlayerCount(message)
            return
        }
        case "log": {
            setupLog(message)
            return
        }
        case "chat stop mirror": {
            if (killMirror) {
                reply(message, "There is no active chat mirror in this channel.", "chat")
            } else {
                // Turns of mirror
                killMirror = true
                reply(message, "Stopped mirroring in game chats to Discord.", "chat")
            }
            return
        }
        case "chat stop listener": {
            if (killListener) {
                reply(message, "There is no active listener mirroring this chat to in game chats.", "chat")
            } else {
                // Turns off listener
                killListener = true
                reply(message, "Stopped mirroring Discord chat to in game chats.", "chat")
            }
            return
        }
        case "chat stop": {
            if (!killListener && !killMirror) {
                // Turns of all chat services
                killMirror = true
                killListener = true
                reply(message, "Terimnated chat services.", "chat")
            } else if (!killListener) {
                // Turns off listener
                killListener = true
                reply(message, "Stopped listener and terimnated chat services.", "chat")
            } else if (!killMirror) {
                // Turns of mirror
                killMirror = true
                reply(message, "Stopped mirror and terimnated chat services.", "chat")
            } else {
                reply(message, "There are no chat services enabled in this channel.", "chat")
            }
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
    // Allows the mirror to be turned on
    killMirror = false
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
    // Allows the listener to be turned on
    killListener = false
    // Creates a virtual terminal to send messages from Discord on the survival server
    postFromDiscord(message, survivalSession)

    // Creates a virtual terminal to send messages from Discord on the creative server
    postFromDiscord(message, creativeSession)
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
function postFromDiscord(message, session) {
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
        if (killListener) {
            virtualTerminal.kill()
        }

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
    const playersOnlineRegex = /There are (\d+) of a max of (\d+) players online:/
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
        if (killMirror) {
            virtualTerminal.kill()
        }

        // Listens for message indicating that a connection has been established
        if (data.includes('System restart required')) {
            updateChatStatus(message, "Success", session, "mirrorChat")
            virtualTerminal.write(`tmux send-keys -t ${session} 'list' C-m\r`)
            virtualTerminal.write(`tmux attach-session -t ${session}\r`)
        }

        // Splits response into lines when encountering a newline character
        const lines = data.split('\n')

        // Loops through lines
        if (lines.find((line) => (line.includes('joined the game') || line.includes('left the game')) && !previousLines.includes(line)) 
            && (new Date() - new Date(session === survivalSession ? listTimeSurvival : listTimeCreative)) / 1000 > 60) {
            session === survivalSession ? listTimeSurvival = new Date() : listTimeCreative = new Date()
            virtualTerminal.write(`list\r`)
        }

        // Listens for message indicating success
        if (data.includes(`INFO]`)) {
            // Loops through lines
            for (const line of lines) {
                // Ignores lines sent before the bot started
                if (!ignoredInitial) {
                    previousLines.push(line)
                }

                const match = line.match(playersOnlineRegex)

                if (match) {
                    // Checks what session is active and updates the playercount
                    session === "liveSurvival"
                        ? playersSurvival = parseInt(match[1])
                        : playersCreative = parseInt(match[1])
                }

                // Checks if content is new, not empty and a chat or death message
                if (line.trim() !== '' && !previousLines.includes(line) && !line.includes("[Not Secure]") && (line.includes('<') || isDeath(line))) {
                    // Checks and removes discord ping and date object
                    const first = line.slice(16).replace(/@/g,'')

                    // Checks and removes terminal buffer
                    const sanitized = first.includes("[K") ? first.slice(0, first.length - 4) : first

                    if (isDeath(sanitized)) {
                        const start = sanitized.indexOf(': ')
                        sayOnServer(session === survivalSession ? creativeSession : survivalSession, sanitized.slice(start + 2))
                        message.channel.send(`**${sanitized.slice(start + 2)}**`)
                    }

                    // Checks if first character is correct
                    if (sanitized.includes('<') && sanitized.includes('>')){
                        const match = line.match(/<([^>]+)>/)
                        const long = line.slice(match.index).replace('<', '').replace('>', ':')

                        // Checks that the message is not repeated
                        if (!previousLines.includes(long)) {
                            // Sends the message on the other server
                            sayOnServer(session === survivalSession ? creativeSession : survivalSession, sanitized)

                            // Removes weird handling of norwegian letters
                            const remove = long.replace(/\[K/, '').replace('[1;29r', '').replace('[29;1H', '').trim()

                            // Sends the message in Discord
                            message.channel.send(remove)
                        }
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

function setupLog(message) {
    const storechannel = [
        `echo """{\\"token\\": \\"${config.token}\\", \\"clientId\\": \\"${config.clientId}\\", \\"guildId\\": \\"${config.guildId}\\", \\"docker_username\\": \\"${config.docker_username}\\", \\"docker_password\\": \\"${config.docker_password}\\", \\"roleID\\": \\"${config.roleID}\\", \\"minecraft_command\\": \\"${config.minecraft_command}\\", \\"minecraft_log\\": \\"${message.channelId}\\"}""" > config.json`
    ]
    
    // Run a command on your system using the exec function
    const child = exec(storechannel.join(' && '))

    reply(message, `Spawned child ${child.pid}`, "log")

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(data)
        reply(message, `${data.slice(0, 1024)}`, "log")
    })

    child.stderr.on('data', (data) => {
        console.error(data)
        reply(message, `${data.slice(0, 1024)}`, "log")
    })

    child.on('close', () => {
        reply(message, `Killed child ${child.pid}`, "log")
        reply(message, `Now logging whitelists commands in <#${message.channelId}>`, "log")
    })
}

/**
 * Updates the channel description of the channel tracking the Minecraft chats with the player counts.
 * @param {*} message Message object
 */
async function updatePlayerCount(message) {
    const channel = message.channel
    
    // Gives initial 10 second window to find online status
    await new Promise(resolve => setTimeout(resolve, 10000))

    // Runs once per 5 minutes as long as the chat is being mirrored
    while (!killMirror) {
        // Updates the channel topic
        channel.setTopic(`Logins Minecraft server. Online: ${playersSurvival + playersCreative} Survival: ${playersSurvival} Creative: ${playersCreative}`)

        // Waits for 5 minutes
        await new Promise(resolve => setTimeout(resolve, 300000))
    }
}

function isDeath(text) {
    if (
        (text.includes('blew up')
        || text.includes('burned to death')
        || text.includes('death.fell.accident.water')
        || text.includes("didn't want to live")
        || text.includes('died')
        || text.includes('discovered the floor was lava')
        || text.includes('drowned')
        || text.includes('experienced kinetic energy')
        || text.includes('fell from a high place')
        || text.includes('fell off')
        || text.includes('fell out of the world')
        || text.includes('fell while climbing')
        || text.includes('froze to death')
        || text.includes('hit the ground too hard')
        || text.includes('left the confines of this world')
        || text.includes('starved to death')
        || text.includes('suffocated in a wall')
        || text.includes('tried to swim in lava')
        || text.includes('walked into a cactus while trying to escape')
        || text.includes('walked into fire while fighting')
        || text.includes('walked into the danger zone due to')
        || text.includes('was blown up by')
        || text.includes('was burned to a crisp while fighting')
        || text.includes('was doomed to fall')
        || text.includes('was fireballed by')
        || text.includes('was frozen to death by')
        || text.includes('was impaled by')
        || text.includes('was impaled on a stalagmite')
        || text.includes('was killed')
        || text.includes('was obliterated by a sonically-charged shriek')
        || text.includes('was poked to death by a sweet berry bush')
        || text.includes('was pricked to death')
        || text.includes('was pummeled by')
        || text.includes('was shot by')
        || text.includes('was skewered by a falling stalactite')
        || text.includes('was slain by')
        || text.includes('was squashed by')
        || text.includes('was squished too much')
        || text.includes('was struck by lightning')
        || text.includes('was stung to death')
        || text.includes('went off with a bang')
        || text.includes('went up in flames')
        || text.includes('withered away'))
        && !text.includes('<') && !text.includes('>')
    ) {
        return true
    } else {
        return false
    }
}
