import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

// Retry button
const retry = new ButtonBuilder()
    .setCustomId('retryDeployment')
    .setLabel('Retry')
    .setStyle(ButtonStyle.Secondary)

// Abort button
const abort = new ButtonBuilder()
    .setCustomId('error')
    .setLabel('Aborted.')
    .setStyle(ButtonStyle.Danger)

// Cancel button
const cancel = new ButtonBuilder()
    .setCustomId('cancel')
    .setLabel('Cancel')
    .setStyle(ButtonStyle.Danger)

// Trash button
const trash = new ButtonBuilder()
    .setCustomId('trash')
    .setLabel('🗑️')
    .setStyle(ButtonStyle.Secondary)

const initialButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(cancel, trash)

const abortButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(abort, trash)

const errorButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(retry, trash)

const successButtons = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(trash)

export {
    initialButtons,
    abortButtons,
    errorButtons,
    successButtons
}
