import { ActionRowBuilder, StringSelectMenuBuilder, } from "discord.js";
import topics from "./topics.js";
import isTicketChannel from "./ticket.js";
export default async function handleTagTicket(interaction) {
    const selectTags = new StringSelectMenuBuilder()
        .setCustomId('add_tag_to_open_ticket')
        .setPlaceholder('Select a tag')
        .addOptions(topics);
    const tags = new ActionRowBuilder().addComponents(selectTags);
    await interaction.reply({
        content: 'Choose ticket:',
        components: [tags],
    });
}
export async function tagTicket(interaction) {
    const isTicket = await isTicketChannel(interaction);
    if (!isTicket)
        return;
    try {
        // Check if interaction has already been deferred
        if (!interaction.deferred) {
            await interaction.deferUpdate();
        }
        // Get the channel where the tags should be applied
        const channel = interaction.channel;
        // Fetch the current topic (description)
        const currentTopic = channel.topic || '';
        // Prepare the tag string
        // @ts-expect-error
        const newTags = interaction.values
            .map((tag) => `🏷️ ${tag}`)
            // Filters out tags that already exist in the topic
            .filter((tag) => !currentTopic.includes(tag))
            .join(', ');
        // If there are new tags, append them to the current topic
        if (newTags) {
            const updatedTopic = currentTopic
                // Append to the existing topic
                ? `${currentTopic} · ${newTags}`
                : newTags; // Just uses the tags if no topic is available
            // Updates the channel description with the appended tags
            await channel.setTopic(updatedTopic);
            channel.send(`${interaction.user.username} tagged the ticket with ${newTags}`);
        }
    }
    catch (err) {
        const error = err;
        // Handle errors appropriately
        if (error.name === 'InteractionAlreadyReplied') {
            console.warn('Interaction has already been replied to or deferred.');
        }
        else {
            console.error('Failed to update channel description:', error);
        }
    }
}
