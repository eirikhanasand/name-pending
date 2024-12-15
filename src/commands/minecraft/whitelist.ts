import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import log from '../../utils/logger.js'
import config from '../../utils/config.js'
import sanitize from '../../utils/sanitize.js'

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
export async function execute(message: ChatInputCommandInteraction<CacheType>) {
    // Slices to avoid overflow errors, checks to avoid passing undefined parameters
    const user = message.options.getString('user') ? sanitize(message.options.getString('user')?.slice(0, 30) || "") : null

    if (!user) {
        await message.reply({content: "You must provide a user: `/whitelist user:name`", ephemeral: true})
        return
    }

    // Sanitizes user before adding them to protect against xml attacks
    await post(message, user)
}

async function post(message: ChatInputCommandInteraction<CacheType>, name: string) {
    let content = ""

    await Promise.all(
        config.minecraft_servers.map(async (server) => {
            const fullUrl = `${config.minecraft_url}:${server.port}/${server.name}-whitelist`
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {'Content-Type': 'application/json', name, action: "add"}
            })
            
            switch (response.status) {
                case 304: content = `${name} is already whitelisted.`; break
                case 418: content = `Added ${name} to the whitelist.`; break
                case 404: content = `There is no Minecraft account named ${name}. Please try again.`; break
                default: content = "Please try again."; break
            }
        })
    )

    if (content) {
        await message.reply({content, ephemeral: true})
        log(message, content)
    }
}
