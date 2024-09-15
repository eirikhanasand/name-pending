import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonInteraction, 
    ButtonStyle, 
    EmbedBuilder, 
    PermissionOverwriteManager, 
    StringSelectMenuBuilder, 
    TextChannel 
} from "discord.js"
import { getTickets } from "./ticket.js"

export default async function invite(interaction: ButtonInteraction) {
    // Fetches all text channels that the user has access to
    const options = await getTickets(interaction)

    // Creates a channel select menu for choosing a channel
    const selectChannel = new StringSelectMenuBuilder()
        .setCustomId('invite_to_ticket')
        .setPlaceholder('Select ticket to create invitation to')
        .addOptions(options)

    // Creates an action row that holds the select menu
    const actionRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectChannel)

    // Sends the message with the select menu
    await interaction.reply({ components: [actionRow], ephemeral: true })
}

export async function inviteToTicket(interaction: ButtonInteraction) {
    const guild = interaction.guild

    if (guild === null) {
        return
    }

    // @ts-expect-error
    const channel = guild.channels.cache.get(interaction.values[0]) as TextChannel | undefined
    if (!channel || !(channel instanceof TextChannel)) {
        return await interaction.reply({
            content: `Could not find the specified channel.`,
            ephemeral: true,
        })
    }

    const embed = new EmbedBuilder()
        .setTitle(`Invitation to <#${channel.id}>`)
        .setDescription(channel.topic)
        .setColor("#fd8738")
        .setTimestamp()

    // Creates 'join' button
    const create = new ButtonBuilder()
        .setCustomId('join_ticket')
        .setLabel('Join Ticket')
        .setStyle(ButtonStyle.Primary)

    // Creates the button row in UI
    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(create)
    await interaction.reply({ embeds: [embed], components: [buttons] })
}

export async function joinTicket(interaction: ButtonInteraction) {
    // Finds the ID of the ticket the user wants to join

    const id = findTicketID(interaction.message.embeds[0].data.title as string)
    const user = interaction.user
    const guild = interaction.guild

    // Finds the channel
    // @ts-expect-error
    const channel = guild.channels.cache.get(id) as TextChannel | undefined
    if (!channel || !(channel instanceof TextChannel)) {
        return await interaction.reply({
            content: `Could not find the specified channel.`,
            ephemeral: true,
        })
    }

    // Adds the user to the channel
    const permissionOverwrites = channel.permissionOverwrites as PermissionOverwriteManager

    await permissionOverwrites.edit(user, {
        ViewChannel: true,
        SendMessages: true,
        AddReactions: true,
        UseExternalEmojis: true,
        ReadMessageHistory: true,
    })

    await interaction.reply({
        content: `Joined <#${channel.id}>`
    })

    // Lets the people in the channel know that someone joined.
    channel.send(`${interaction.user.username} joined the ticket.`)
}

function findTicketID(title: string): string {
    if (title) {
        const match = title.match(/\d+/);

        if (!match) {
            return 'unknown'
        }

        return match[0]
    }

    return 'unknown'
}