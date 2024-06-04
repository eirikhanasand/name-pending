import { REST, Routes } from 'discord.js'
import config from './utils/config.js'
import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const clientId = config.clientId
const guildId = config.guildId
const token = config.token

const commands = []

// Fetching folders inside of the commands folder
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const foldersPath = join(__dirname, 'commands')
const commandFolders = readdirSync(foldersPath)

for (const folder of commandFolders) {
    // Fetching all commands from all folders in the commands directory
    const commandsPath = join(foldersPath, folder)
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
        const filePath = join(commandsPath, file)

        // Importing and pushing commands to Discord
        try {
            const module = await import(filePath)

            if ('data' in module && 'execute' in module) {
                commands.push(module.data.toJSON())
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`)
            }
        } catch (error) {
            console.error(`Error importing ${filePath}: ${error}`)
        }
    }
}

// Constructing and preparing an instance of the REST module
// Do not remove the semicolon, it is necesarry for the IIFE below to work.
const rest = new REST({ version: '10' }).setToken(token);

// Deploying commands to Discord
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // Check for duplicate command names
        const commandNames = commands.map(cmd => cmd.name);
        const duplicates = commandNames.filter((name, index) => commandNames.indexOf(name) !== index);

        if (duplicates.length > 0) {
            console.error(`Duplicate command names found: ${duplicates.join(', ')}`);
            return;
        }

        // Refreshing all commands
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        ) as RestData[];

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error("here", error);
    }
})();
