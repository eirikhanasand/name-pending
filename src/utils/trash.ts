import { ButtonInteraction, Role } from "discord.js"
import { Roles } from "../../interfaces.js"
import config from "./config.js"

export default async function trash(interaction: ButtonInteraction) {
    const message = interaction.message
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)
    if (!isAllowed) {
        return await interaction.reply({ content: "Unauthorized.", ephemeral: true })
    }
    await (interaction as ButtonInteraction).message.delete()
}
