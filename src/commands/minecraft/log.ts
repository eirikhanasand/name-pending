import { ChatInputCommandInteraction, Role, SlashCommandBuilder } from 'discord.js'
import config from '../../../.secrets.js'
import { Roles } from '../../../interfaces.js'

/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('log')
    .setDescription('Logs whitelist commands in this channel.')

/**
 * Executes the setup command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message: ChatInputCommandInteraction) {
    // Checking if the author is allowed to setup services
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply("Unauthorized.")
    }
    
    config.minecraft_log = message.channelId

    await message.reply({ content: `Now logging whitelist commands in <#${message.channelId}>`, ephemeral: true })
}
