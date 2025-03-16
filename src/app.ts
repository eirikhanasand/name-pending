import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import config from './utils/config.js'
import {
    ChatInputCommandInteraction,
    Client,
    Collection,
    Events,
    GatewayIntentBits,
    Interaction,
    Partials,
} from 'discord.js'
import connectToMinecraft from './utils/connectToMinecraft.js'

const token = config.token
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.Message, 
        Partials.Channel, 
        Partials.Reaction, 
        Partials.User,
    ],
}) as any

client.commands = new Collection()
const foldersPath = join(__dirname, 'commands')
const commandFolders = readdirSync(foldersPath)

for (const folder of commandFolders) {
	const commandsPath = join(foldersPath, folder)
	const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'))
	for (const file of commandFiles) {
		const filePath = join(commandsPath, file)
        const command = await import(filePath)
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command)
		} else {
			console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
}

client.once(Events.ClientReady, async () => {
    connectToMinecraft(client)
    console.log("Ready!")
})

client.on(Events.InteractionCreate, async (interaction: Interaction<"cached">) => {
    const chatInteraction = interaction as ChatInputCommandInteraction

	if (!interaction.isChatInputCommand() && !('customId' in interaction)) {
        console.error('Input is not a command nor interaction.')
        return
    }

    const command = client.commands.get(chatInteraction.commandName)
    if (!command && !('customId' in chatInteraction)) {
        return
    }

    if (!command) {
        return
    }

    await command.execute(interaction)
})

client.login(token)

process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Promise Rejection:\n", err)
})

process.on("uncaughtException", async (err) => {
    console.error("Uncaught Promise Exception:\n", err)
})

process.on("uncaughtExceptionMonitor", async (err) => {
    console.error("Uncaught Promise Exception (Monitor):\n", err)
})

export default client
