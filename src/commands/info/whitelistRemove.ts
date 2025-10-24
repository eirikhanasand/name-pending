import { SlashCommandBuilder } from 'discord.js'
import type { CacheType, ChatInputCommandInteraction, Role } from 'discord.js'
import config from '#config'
import log from '#utils/logger.ts'
import type { Roles } from '#interfaces'
import sanitize from '#utils/sanitize.ts'

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
export async function execute(message: ChatInputCommandInteraction) {
    // Slices to avoid overflow errors, checks to avoid passing undefined parameters
    const user = sanitize(message.options.getString('user')?.slice(0, 30) || "") || null

    // Checking if the author is allowed to remove users from the whitelist
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)

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

async function post(message: ChatInputCommandInteraction<CacheType>, name: string) {
    let content = ""

    const fullUrl = `${config.minecraft_server_url}/${config.minecraft_server_name}-whitelist`
    const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', name, action: "remove"}
    })
    
    switch (response.status) {
        case 304: content = `${name} is not on the whitelist.`; break
        case 418: content = `Removed ${name} from the whitelist.`; break
        case 404: content = `There is no Minecraft account named ${name}. Please try again.`; break
        default: content = "Please try again."; break
    }

    if (content) {
        await message.reply({content, ephemeral: true})
        log(message, content)
    }
}
