import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Info regarding the bot.')
export async function execute(message: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle('Info')
        .setDescription('Mirrors the Minecraft and Discord chat.')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Updated", value: "16.03.25"},
            {name: "Updated", value: "09.06.24"},
            {name: "Created", value: "21.08.23"},
        )

    await message.reply({ embeds: [embed]})
}
