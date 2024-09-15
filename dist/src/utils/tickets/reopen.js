import { ActionRowBuilder, CategoryChannel, RoleSelectMenuBuilder, StringSelectMenuBuilder, TextChannel, UserSelectMenuBuilder } from "discord.js";
import { getArchivedTickets } from "./ticket.js";
import topics from "./topics.js";
import formatChannelName from "./format.js";
export default async function handleReopenTicket(interaction) {
    const options = await getArchivedTickets(interaction);
    // Defines the options available to the user
    const selectChannel = new StringSelectMenuBuilder()
        .setCustomId('reopen_channel')
        .setPlaceholder('Select ticket to reopen')
        .addOptions(options);
    // Creates the rows that are displayed to the users
    const channel = new ActionRowBuilder().addComponents(selectChannel);
    await interaction.reply({
        components: [channel],
        ephemeral: true
    });
}
export async function reopenTicket(interaction, view) {
    const guild = interaction.guild;
    if (guild === null) {
        return;
    }
    // @ts-expect-error
    const channel = guild.channels.cache.get(interaction.values[0]);
    if (!channel || !(channel instanceof TextChannel)) {
        return await interaction.reply({
            content: `Could not find the specified channel.`,
            ephemeral: true,
        });
    }
    try {
        // Fetches "tickets" category
        const archive = guild?.channels.cache.find(c => c instanceof CategoryChannel && c.name === "tickets");
        if (!archive) {
            return await interaction.reply({
                content: `Could not find "tickets" category.`,
                ephemeral: true,
            });
        }
        // Moves the channel to the "tickets" category
        await channel.setParent(archive.id, { lockPermissions: false });
        // Adds the user to the channel
        await channel.permissionOverwrites.edit(interaction.user.id, {
            ViewChannel: true,
        });
        const selectTags = new StringSelectMenuBuilder()
            .setCustomId('add_tag_to_create')
            .setPlaceholder('Add tags')
            .addOptions(topics)
            .setMaxValues(10);
        const selectRoles = new RoleSelectMenuBuilder()
            .setCustomId('add_role_to_ticket')
            .setPlaceholder('Add roles')
            .setMinValues(1)
            .setMaxValues(25);
        const selectUsers = new UserSelectMenuBuilder()
            .setCustomId('add_user_to_ticket')
            .setPlaceholder('Add users')
            .setMinValues(1)
            .setMaxValues(25);
        const tags = new ActionRowBuilder().addComponents(selectTags);
        const roles = new ActionRowBuilder().addComponents(selectRoles);
        const users = new ActionRowBuilder().addComponents(selectUsers);
        const viewed = `${view ? 'Viewed' : 'Reopened'} by <@${interaction.user.id}>.`;
        const reopened = `${interaction.user}, your ticket has been reopened!\nPlease select the tags, roles, and users you want to add to this ticket.\nNote that tags can only be set once per 5 minutes.`;
        const content = view ? viewed : reopened;
        const components = view ? undefined : [tags, roles, users];
        await channel.send({ content, components });
        await interaction.reply({
            content: `${formatChannelName(channel.name)} ${view ? 'viewed' : 'reopened'}.`,
            ephemeral: true,
        });
    }
    catch (error) {
        console.error(error);
        await interaction.reply({
            content: `There was an error ${view ? 'viewing' : 'reopening'} the ticket. Please try again later.`,
            ephemeral: true,
        });
    }
}
