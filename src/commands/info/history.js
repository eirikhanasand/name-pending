import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('history')
    .setDescription('The history of the bot')
export async function execute(message) {
    const embed = new EmbedBuilder()
        .setTitle('Historie')
        .setDescription('Bottens historie')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Created", value: "21.08.23", inline: true},
            {name: "Updated", value: "26.08.23", inline: true},
            {name: "Minecraft commands added", value: "10.10.23"},
            {name: "Infrastructure commands added", value: "08.10.23"},
            {name: "Embeds added", value: "26.08.23"},
        )
    await message.reply({ embeds: [embed]})
}
