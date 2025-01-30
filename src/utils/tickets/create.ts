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
    ModalSubmitInteraction,
    ButtonBuilder,
    ButtonStyle
} from "discord.js"
import topics from "./topics.js"
import { DISCORD_URL, ZAMMAD_URL } from "../../../constants.js"
import config from "../config.js"

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

    // Creates modal
    const modal = new ModalBuilder()
        .setCustomId('ticket_modal')
        .setTitle('Ticket')

    // Title
    const title = new TextInputBuilder()
        .setCustomId('ticket_title')
        .setLabel('Ticket Title')
        .setStyle(TextInputStyle.Short)
    
    // Mail
    const mail = new TextInputBuilder()
        .setCustomId('ticket_mail')
        .setLabel('Your NTNU email')
        .setStyle(TextInputStyle.Short)

    // First Name
    // const firstName = new TextInputBuilder()
    //     .setCustomId('ticket_firstname')
    //     .setLabel('First Name')
    //     .setStyle(TextInputStyle.Short)

    // Last name
    // const lastName = new TextInputBuilder()
    //     .setCustomId('ticket_lastname')
    //     .setLabel('Last Name')
    //     .setStyle(TextInputStyle.Short)

    const titleRow = new ActionRowBuilder<TextInputBuilder>().addComponents(title)
    const mailRow = new ActionRowBuilder<TextInputBuilder>().addComponents(mail)
    // const firstNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(firstName)
    // const lastNameRow = new ActionRowBuilder<TextInputBuilder>().addComponents(lastName)
    // modal.addComponents([titleRow, mailRow, firstNameRow, lastNameRow])
    modal.addComponents([titleRow, mailRow])
    
    // Shows modal for text input
    await interaction.showModal(modal)

    try {
        // Waits for modal submission
        const filter = (i: ModalSubmitInteraction) => i.customId === 'ticket_modal' && i.user.id === interaction.user.id

        // 10 minutes to submit
        const submittedModal = await interaction.awaitModalSubmit({ filter, time: 600000 })

        // Retrieves the submitted title
        const title = submittedModal.fields.getTextInputValue('ticket_title')
        const mail = submittedModal.fields.getTextInputValue('ticket_mail')

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

        const selectClose = new ButtonBuilder()
            .setCustomId('close_ticket')
            .setLabel('Close ticket')
            .setStyle(ButtonStyle.Danger)

        // Creates the rows that are displayed to the users
        const tags = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectTags)
        const roles = new ActionRowBuilder<RoleSelectMenuBuilder>().addComponents(selectRoles)
        const users = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(selectUsers)
        const close = new ActionRowBuilder<ButtonBuilder>().addComponents(selectClose)
        const channelId = newChannel.id
        const guildId = interaction.guild?.id

        const ticket = await fetch (`${config.api}/ticket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                "group_id": 37,
                "customer_id": 5567,
                "article": {
                    "subject": title,
                    "body": `Synced with ${DISCORD_URL}/${guildId}/${channelId}.`,
                    "type": "email",
                    "internal": false,
                    "from": "Support",
                    "to": mail,
                    "type_id": 1,
                    "sender_id": 1,
                    "content_type": "text/html"
                },
                "priority_id": 2,
                "state_id": 1,
                "due_at": "2024-09-30T12:00:00Z"
            })
        })

        if (ticket.ok) {
            const id = await ticket.json()
            const text = ticket.status >= 200 && ticket.status <= 300 ? `[ticket](${ZAMMAD_URL}/${id})` : 'ticket'
            // Post a message in the new ticket channel, pinging the user
            newChannel.setName(id)

            await newChannel.send({
                content: `# ${title}\n${interaction.user}, your ${text} has been created!\nPlease select the tags, roles, and users you want to add to this ticket.\nNote that tags can only be set once per 5 minutes.`,
                components: [tags, roles, users, close],
            })
            
            // Acknowledge modal submission
            await submittedModal.reply({ 
                content: `Your ticket <#${newChannel.id}> has been created!`,
                ephemeral: true
            })
        }

    } catch (error) {
        console.error("Error creating ticket channel:", error)
        await interaction.reply({ content: "There was an error creating the ticket. Please try again." })
    }
}
