import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'
import run from '../../utils/db.js'
import sanitize from '../../utils/sanitize.js'

export const data = new SlashCommandBuilder()
    .setName('alert')
    .setDescription('Alert yourself of something at a later time.')
    .addStringOption((option) =>
        option
            .setName("title")
            .setDescription(
                "Title of the alert.",
            )
            .setRequired(true)
    )
    .addChannelOption((option) =>
        option
            .setName("channel")
            .setDescription(
                "Channel to alert in.",
            )
            .setRequired(true)
    )
    .addAttachmentOption((attachment) => 
        attachment
            .setName("attachment")
            .setDescription(
                "Attachments to include in the alert"
            )
    )
export async function execute(message: ChatInputCommandInteraction) {
    const title = sanitize(message.options.getString('title') || '')
    const a = await run(
        `INSERT INTO schedule (name) 
         SELECT $1 WHERE NOT EXISTS (SELECT 1 FROM schedule WHERE name = $1);`, 
        [title]
    )

    console.log(a)
    await message.reply(a as unknown as string)
}
