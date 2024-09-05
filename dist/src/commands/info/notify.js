import { SlashCommandBuilder } from 'discord.js';
import sendNotification from '../../utils/sendNotification.js';
import config from '../../utils/config.js';
/**
 * Builds a new slash command with the given name, description and options
 */
export const data = new SlashCommandBuilder()
    .setName('notify')
    .setDescription('Sends a notification to the Login app.')
    .addStringOption((option) => option
    .setName('title')
    .setDescription('Title of the notification'))
    .addStringOption((option) => option
    .setName('description')
    .setDescription('Description of the notification'))
    .addStringOption((option) => option
    .setName('topic')
    .setDescription('Topic of the notification'))
    .addStringOption((option) => option
    .setName('screen')
    .setDescription('(optional) Screen of the notification'));
/**
 * Executes the whitelist command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message) {
    // Slices to avoid overflow errors, checks to avoid passing undefined parameters
    const title = message.options.getString('title');
    const description = message.options.getString('description');
    const topic = message.options.getString('topic');
    const screen = {
        id: message.options.getString('screen')
    };
    // Checking if the author is allowed to remove users from the whitelist
    const isAllowed = message.member?.roles?.cache.some((role) => role.id === config.roleID || role.id === config.styret);
    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: "Unauthorized.", ephemeral: true });
    }
    if (!title || !description || !topic) {
        return await message.reply({
            content: `You must provide a ${title ? '' : 'title'} ${description ? '' : 'description'} ${topic ? '' : 'topic'} to send notifications`,
            ephemeral: true
        });
    }
    try {
        await message.reply({ content: "Working...", ephemeral: true });
        const response = await sendNotification({ title, description, topic, screen });
        if (response) {
            return await message.editReply(`Successfully sent notification to topic ${topic} at ${new Date().toISOString()}`);
        }
        return await message.editReply(`Failed to send notification ${title} to ${topic}, but no errors were caught.`);
    }
    catch (error) {
        return await message.editReply(`Failed to send notification ${title} to ${topic}. Error: ${error}.`);
    }
}
