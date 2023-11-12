import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { Client, Collection, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js'
import config from '../config.json' assert { type: "json" }
import info from '../../info.json' assert { type: "json" }
import { exec } from 'child_process'

const token = config.token

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildModeration
] })

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
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
		}
	}
}

client.once(Events.ClientReady, async message => {
    // client.application.commands.set([]) // Use to perge all inactive slash commands from Discord
    console.log("Ready!")

    if (info.channelID && info.username && info.userID) {
        const mID = (await message.channels.fetch(info.channelID)).lastMessageId
        const msg = await message.channels.fetch(info.channelID).then(channel => channel.messages.fetch(mID))
        const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarted the bot.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${info.username} · ${info.userID}`})
        .addFields(
            {name: "Status", value: "Success", inline: true},
            {name: "Reason", value: info.reason, inline: true},
            {name: "Branch", value: info.branch, inline: true},
        )

        try {
            await msg.edit({ embeds: [embed]})
        } catch (e) {
            const channel = msg.channel
            await channel.send({ embeds: [embed] })
        }

        const commands = [
            `echo '{"branch": "", "reason": "", "channelID": "", "username": "", "userID": ""}' > ../info.json`,
            'rm ../temp.sh'
        ]
    
        exec(commands.join(' && '))
    }

})

client.on(Events.InteractionCreate, async message => {
	if (!message.isChatInputCommand()) return

	const command = client.commands.get(message.commandName)

	if (!command) return

	try {
		await command.execute(message)
	} catch (error) {
        // Ignoring error as another process is handling it
        // console.log(error)
	}
})

client.login(token)

// https://linjeforeningen.it does not work, timeout error