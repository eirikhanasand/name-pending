import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'
import config from '../../../config.js'
import { exec } from 'child_process'

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
    const isAllowed = message.member?.roles.cache.some(role => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply("Unauthorized.")
    }

    const storechannel = [
        `echo """{\\"token\\": \\"${config.token}\\", \\"clientId\\": \\"${config.clientId}\\", \\"guildId\\": \\"${config.guildId}\\", \\"docker_username\\": \\"${config.docker_username}\\", \\"docker_password\\": \\"${config.docker_password}\\", \\"roleID\\": \\"${config.roleID}\\", \\"minecraft_command\\": \\"${config.minecraft_command}\\", \\"minecraft_log\\": \\"${message.channelId}\\"}""" > config.json`
    ]
    
    const child = exec(storechannel.join(' && '))

    await message.reply({ content: `Now logging whitelist commands in <#${message.channelId}>`, ephemeral: true })
}
