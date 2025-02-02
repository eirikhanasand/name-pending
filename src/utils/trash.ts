import { ButtonInteraction, GuildMember, Role } from "discord.js"
import config from "./config.js"

export default async function trash(interaction: ButtonInteraction) {
    const member = interaction.member as GuildMember
    const isAllowed = member.roles.cache.some((role: Role) => role.id === config.roleID)
    if (!isAllowed) {
        return await interaction.reply({ content: "Unauthorized.", ephemeral: true })
    }
    await (interaction as ButtonInteraction).message.delete()
}
