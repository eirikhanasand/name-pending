import { 
    ActionRowBuilder, 
    ButtonInteraction, 
    RoleSelectMenuBuilder,
    UserSelectMenuBuilder, 
} from "discord.js"
import isTicketChannel from "./ticket.js"

export default async function handleAddToTicket(interaction: ButtonInteraction) {
    const isTicket = await isTicketChannel(interaction)
    if (!isTicket) return

    const selectRoles = new RoleSelectMenuBuilder()
        .setCustomId('add_role_to_ticket')
        .setPlaceholder('Add roles')
        .setMinValues(1)
        .setMaxValues(25)

    const selectUsers = new UserSelectMenuBuilder()
        .setCustomId('add_user_to_ticket')
        .setPlaceholder('Add users')
        .setMinValues(1)
        .setMaxValues(25)

    // Creates the rows that are displayed to the user
    const roles = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectRoles)
    const users = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectUsers)

    await interaction.reply({
        content: 'Add users or roles to this ticket:',
        components: [roles, users],
        ephemeral: true
    })
}

export async function handleAddViewerToTicket(interaction: ButtonInteraction) {
    const isTicket = await isTicketChannel(interaction)
    if (!isTicket) return
    
    const selectRoles = new RoleSelectMenuBuilder()
        .setCustomId('add_role_viewer_to_ticket')
        .setPlaceholder('Add roles')
        .setMinValues(1)
        .setMaxValues(25)

    const selectUsers = new UserSelectMenuBuilder()
        .setCustomId('add_user_viewer_to_ticket')
        .setPlaceholder('Add users')
        .setMinValues(1)
        .setMaxValues(25)

    // Creates the rows that are displayed to the user
    const roles = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectRoles)
    const users = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectUsers)

    await interaction.reply({
        content: 'Add users or roles to this ticket:',
        components: [roles, users],
        ephemeral: true
    })
}
