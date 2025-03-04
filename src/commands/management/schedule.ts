import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'
import run from '../../utils/db.js'
import sanitize from '../../utils/sanitize.js'

export const data = new SlashCommandBuilder()
    .setName('schedule')
    .setDescription('Schedule a message for a later time.')
    .addStringOption((option) =>
        option
            .setName("title")
            .setDescription(
                "Title of the message.",
            )
            .setRequired(true)
    )
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription(
                "Channel to send the message in.",
            )
            .setRequired(true)
    )
    .addStringOption((time) => 
        time
            .setName("time")
            .setDescription("Time to send the schedule message")
            .setRequired(true)
    )
    .addAttachmentOption((attachment) => 
        attachment
            .setName("attachment")
            .setDescription(
                "Attachments to include in the message"
            )
    )
export async function execute(message: ChatInputCommandInteraction) {
    const title = sanitize(message.options.getString('title') || '')
    const channel = message.options.getChannel('channel')
    const attachment = message.options.getAttachment('attachment')
    const time = sanitize(message.options.getString('time') || '')
    try {
        await run(
            `INSERT INTO schedule (name) 
             SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM schedule WHERE name = $1);`, 
            [title]
        )
        const res = await run(
            `SELECT name from schedule;`, 
            [title]
        )
        console.log("props", title, channel, attachment, time)
        console.log(res)
        await message.reply("Scheduled message")
    } catch (error) {
        console.error(`Something went wrong while scheduling message: ${JSON.stringify(error)}`)
    }
}
