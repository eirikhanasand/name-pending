import { ChatInputCommandInteraction, Role, SlashCommandBuilder } from 'discord.js'
import config from '../../../config.js'
import { Roles } from '../../../interfaces.js'

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
    .setDescription('(optional) Screen of the notification'))
/**
 * Executes the whitelist command passed from Discord
 * @param {*} message Message initiating the command, passed by Discord
 */
export async function execute(message: ChatInputCommandInteraction) {
    // Slices to avoid overflow errors, checks to avoid passing undefined parameters
    const title = message.options.getString('title')
    const description = message.options.getString('description')
    const topic = message.options.getString('topic')
    const screen = message.options.getString('screen')

    // Checking if the author is allowed to remove users from the whitelist
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID || role.id === config.styret)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: "Unauthorized.", ephemeral: true })
    }

    
    if (!title || !description || !topic) {
        return await message.reply({
            content: `You must provide a ${title ? '' : 'title'} ${description ? '' : 'description'} ${topic ? '' : 'topic'} to send notifications`,
            ephemeral: true
        })
    }
    
    await message.reply({ content: "Working...", ephemeral: true })

    // Sanitizes user before removing them to protect against xml attacks
    const response = await notify(title, description, topic, screen ? screen : undefined)

    if (response) {
        return await message.editReply(`Successfully sent notification to topic ${topic} at ${new Date().toISOString()}`)
    }

    return await message.editReply(`Failed to send notification ${title} to ${topic}. Please try again later.`)
}

async function notify(title: string, description: string, topic: string, screen: string | undefined) {
    // Sets the topic to maintenance if the topic is not available
    if (!topic) topic = "maintenance"

    // Defines the message to be sent
    const message = {
        to: `/topics/${topic}`,
        notification: {
            title: title,
            body: description,
        },
        data: screen
    }
    
    // Defines the fetch request to be sent with all info attached
    const options = {
        method: "POST",
        headers: {
            "Authorization": `key=${config.api_key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(message)
    }

    // Sends the notification and waits for response
    const response = await fetch(config.api_url, options)

    if (response) {
        return true
    }

    return false
}
