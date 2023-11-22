import { SlashCommandBuilder } from 'discord.js'
import config from "../../../config.json" assert {type: "json"}
import log from './logger.js'

const url = "http://51.222.254.125"
const servers = [{port: 6677, name: 'survival'}, {port: 6688, name: 'creative'}]

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
    // Slices to avoid overflow errors, checks to avoid passing undefined parameters
    const user = message.options.getString('user') ? message.options.getString('user').slice(0, 30) : null

    // Checking if the author is allowed to remove users from the whitelist
    const isAllowed = message.member.roles.cache.some(role => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({content: "Unauthorized.", ephemeral: true})
    }

    if (!user) {
        return await message.reply({
            content: "You must provide a user: `/whitelist user:name`", 
            ephemeral: true
        })
    }

    // Sanitizes user before removing them to protect against xml attacks
    await post(message, user)
}

async function post(message, name) {
    let content = ""

    await Promise.all(
        servers.map(async (server) => {
            const fullUrl = `${url}:${server.port}/${server.name}-whitelist`
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', name, action: "remove"}
            })
            
            switch (response.status) {
                case 304: content = `${name} is not on the whitelist.`; break;
                case 418: content = `Removed ${name} from the whitelist.`; break;
                case 404: content = `There is no Minecraft account named ${name}. Please try again.`; break;
                default: content = "Please try again."; break;
            }
        })
    )

    if (content) {
        await message.reply({content, ephemeral: true})
        log(message, content)
    }
}
