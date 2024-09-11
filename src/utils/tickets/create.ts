import { 
    ButtonInteraction, 
    Guild, 
    TextChannel, 
    PermissionsBitField, 
    CategoryChannel, 
    StringSelectMenuBuilder, 
    RoleSelectMenuBuilder, 
    ActionRowBuilder, 
    UserSelectMenuBuilder, 
    ChannelType,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalSubmitInteraction
} from "discord.js"
import topics from "./topics.js"

export default async function handleCreateTicket(interaction: ButtonInteraction) {
    const guild = interaction.guild as Guild
    
    if (!guild) {
        return interaction.reply({ content: "This command can only be used in a server.", ephemeral: true })
    }

    const channels = guild.channels.cache

    // Find all channels with names matching the ticket[ID] pattern
    const ticketChannels = channels
        .filter(channel => channel instanceof TextChannel && /^ticket\d+$/.test(channel.name))
        .map(channel => parseInt(channel.name.replace("ticket", ""), 10))
        .sort((a, b) => a - b)

    // Finds the lowest available ticket number
    let newTicketId = 1
    for (const id of ticketChannels) {
        if (newTicketId === id) {
            newTicketId++
        } else {
            break
        }
    }

    const newChannelName = `ticket${newTicketId}`

    // Create a modal for text input
    const modal = new ModalBuilder()
        .setCustomId('ticket_modal')
        .setTitle('Ticket')

    // Add a text input field to the modal
    const textInput = new TextInputBuilder()
        .setCustomId('ticket_title')
        .setLabel('Ticket Title')
        .setStyle(TextInputStyle.Short)

    const textActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput)
    modal.addComponents(textActionRow)

    // Show modal for text input
    await interaction.showModal(modal)

    try {
        // Wait for modal submission
        const filter = (i: ModalSubmitInteraction) => i.customId === 'ticket_modal' && i.user.id === interaction.user.id
        // 5 minutes to submit
        const submittedModal = await interaction.awaitModalSubmit({ filter, time: 300000 })

        // Retrieve the submitted title
        const title = submittedModal.fields.getTextInputValue('ticket_title')

        // Create the new channel in a category (if you have a category for tickets)
        const category = guild.channels.cache.find(c => c instanceof CategoryChannel && c.name === "tickets") as CategoryChannel

        const newChannel = await guild.channels.create({
            name: newChannelName,
            type: ChannelType.GuildText,
            parent: category?.id,
            topic: title,
            permissionOverwrites: [
                {
                    // Denies access to everyone
                    id: guild.roles.everyone,
                    deny: [PermissionsBitField.Flags.ViewChannel],
                },
                {
                    // Allows access to the user who created the ticket
                    id: interaction.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                },
                {
                    // Grants access to the bot
                    id: interaction.client.user.id,
                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                }
            ]
        })

        const selectTags = new StringSelectMenuBuilder()
            .setCustomId('add_tag_to_create')
            .setPlaceholder('Add tags')
            .addOptions(topics)
            .setMaxValues(10)

        const selectRoles = new RoleSelectMenuBuilder()
            .setCustomId('add_role_to_create')
            .setPlaceholder('Add roles')
            .setMinValues(1)
            .setMaxValues(3)

        const selectUsers = new UserSelectMenuBuilder()
            .setCustomId('add_user_to_create')
            .setPlaceholder('Add users')
            .setMinValues(1)
            .setMaxValues(10)

        // Creates the rows that are displayed to the users
        const tags = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectTags)
        const roles = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectRoles)
        const users = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectUsers)

        // Post a message in the new ticket channel, pinging the user
        await newChannel.send({
            content: `${interaction.user}, your ticket "${title}" has been created!\nPlease select the tags, roles, and users you want to add to this ticket.\nNote that tags can only be set once per 5 minutes.`,
            components: [tags, roles, users],
        })

        // Acknowledge modal submission
        await submittedModal.reply({ content: `Your ticket <#${newChannel.id}> has been created!`, ephemeral: true })
    } catch (error) {
        console.error("Error creating ticket channel:", error)
        await interaction.reply({ content: "There was an error creating the ticket. Please try again.", ephemeral: true })
    }
}