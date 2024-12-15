import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Role } from 'discord.js'
import { Roles } from '../../../interfaces.js'
import config from '../../utils/config.js'

export const data = new SlashCommandBuilder()
    .setName('release')
    .setDescription('Releases a new version of a repository to production.')
export async function execute(message: ChatInputCommandInteraction) {
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID || role.id === config.styret)
    
    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: "Unauthorized.", ephemeral: true })
    }

    const embed = new EmbedBuilder()
        .setTitle('Release')
        .setColor("#fd8738")
        .setTimestamp()

    await message.reply({ embeds: [embed]})
}
