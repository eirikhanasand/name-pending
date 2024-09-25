import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js"
import handleTagTicket, { tagTicket } from "./tickets/tag.js"
import { handleCloseSelectedTicket, handleCloseTicket } from "./tickets/close.js"
import handleViewTicket from "./tickets/view.js"
import handleReopenTicket, { reopenTicket } from "./tickets/reopen.js"
import handleCreateTicket from "./tickets/create.js"
import addRoleToCreate from "./tickets/roles.js"
import manageUser from "./tickets/users.js"
import handleAddToTicket, { handleAddViewerToTicket } from "./tickets/add.js"
import manageRoles from "./tickets/roles.js"
import handleRemoveFromTicket from "./tickets/remove.js"
import { nextPage, previousPage } from "./help.js"
import { inviteToTicket, joinTicket } from "./tickets/invite.js"

export default async function handleComponents(interaction: ButtonInteraction | ChatInputCommandInteraction, id: string | undefined) {    
    const buttonInteraction = interaction as ButtonInteraction

    // id is present if interaction is ChatInputCommandInteraction
    switch (id || buttonInteraction.customId) {
        case 'create_ticket2':
            await handleCreateTicket(buttonInteraction)
            break
        case 'view_ticket':
            await handleViewTicket(buttonInteraction)
            break
        case 'tag_ticket':
            await handleTagTicket(buttonInteraction)
            break
        case 'close_ticket':
            await handleCloseTicket(buttonInteraction)
            break
        case 'reopen_ticket':
            await handleReopenTicket(buttonInteraction)
            break
        case 'close_ticket_selected':
            await handleCloseSelectedTicket(buttonInteraction)
            break
        case 'add_tag_to_create':
        case 'add_tag_to_open_ticket':
            await tagTicket(buttonInteraction)
            break
        case 'add_role_to_create':
        case 'add_role_to_ticket':
            await addRoleToCreate(buttonInteraction)
            break
        case 'add_user_to_ticket':
        case 'add_user_to_create':
            await manageUser(buttonInteraction)
            break
        case 'remove_user_from_ticket':
            await manageUser(buttonInteraction, undefined, true)
            break
        case 'remove_role_from_ticket':
            await manageRoles(buttonInteraction, undefined, true)
            break
        case 'add':
            await handleAddToTicket(buttonInteraction)
            break
        case 'add_user_viewer_to_ticket':
            await manageUser(buttonInteraction, false)
            break
        case 'add_role_viewer_to_ticket':
            await addRoleToCreate(buttonInteraction, false)
            break
        case 'addviewer':
            await handleAddViewerToTicket(buttonInteraction)
            break
        case 'remove':
            await handleRemoveFromTicket(buttonInteraction)
            break
        case 'view_ticket_command':
            await reopenTicket(buttonInteraction, true)
            break
        case 'reopen_channel':
            await reopenTicket(buttonInteraction)
            break
        case 'next_page_help':
            await nextPage(buttonInteraction)
            break
        case 'previous_page_help':
            await previousPage(buttonInteraction)
            break
        case 'invite_to_ticket':
            await inviteToTicket(buttonInteraction)
            break
        case 'join_ticket':
            await joinTicket(buttonInteraction)
            break
        default:
            console.error(`${buttonInteraction.customId || id} is unhandled in handleComponents.`)
            await buttonInteraction.reply({ content: `Unknown action. ${buttonInteraction.customId}`, ephemeral: true })
            break
    }
}
