import { ButtonInteraction } from "discord.js";

export default async function handleComponents(interaction: ButtonInteraction) {
    // Check if the interaction is a button click
    const buttonInteraction = interaction
    switch (buttonInteraction.customId) {
        case 'create_ticket':
            await handleCreateTicket(buttonInteraction);
            break;
        case 'view_ticket':
            await handleViewTicket(buttonInteraction);
            break;
        case 'tag_ticket':
            await handleTagTicket(buttonInteraction);
            break;
        case 'close_ticket':
            await handleCloseTicket(buttonInteraction);
            break;
        case 'reopen_ticket':
            await handleReopenTicket(buttonInteraction);
            break;
        default:
            await buttonInteraction.reply({ content: 'Unknown action.', ephemeral: true });
            break;
    }
}


async function handleCreateTicket(interaction: ButtonInteraction) {
    // Code to handle ticket creation
    await interaction.reply({ content: 'Ticket created!', ephemeral: true });
}

async function handleViewTicket(interaction: ButtonInteraction) {
    // Code to handle viewing tickets
    await interaction.reply({ content: 'Viewing ticket!', ephemeral: true });
}

async function handleTagTicket(interaction: ButtonInteraction) {
    // Code to handle tagging tickets
    await interaction.reply({ content: 'Tagging ticket!', ephemeral: true });
}

async function handleCloseTicket(interaction: ButtonInteraction) {
    // Code to handle closing tickets
    await interaction.reply({ content: 'Ticket closed!', ephemeral: true });
}

async function handleReopenTicket(interaction: ButtonInteraction) {
    // Code to handle reopening tickets
    await interaction.reply({ content: 'Ticket reopened!', ephemeral: true });
}