import { 
    ActionRowBuilder, 
    ButtonInteraction, 
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder, 
} from "discord.js"
import isTicketChannel from "./ticket.js"

export default async function handleRemoveFromTicket(interaction: ButtonInteraction) {
    const isTicket = await isTicketChannel(interaction)
    if (!isTicket) return

    const selectRoles = new RoleSelectMenuBuilder()
        .setCustomId('remove_role_from_ticket')
        .setPlaceholder('Remove roles')
        .setMinValues(1)
        .setMaxValues(25)

    const selectUsers = new UserSelectMenuBuilder()
        .setCustomId('remove_user_from_ticket')
        .setPlaceholder('Remove users')
        .setMinValues(1)
        .setMaxValues(25)

    // Creates the rows that are displayed to the user
    const roles = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectRoles)
    const users = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectUsers)

    await interaction.reply({
        content: 'Remove users or roles from this ticket:',
        components: [roles, users],
        ephemeral: true
    })
}
