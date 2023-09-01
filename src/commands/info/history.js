import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('history')
    .setDescription('The history of the bot');
export async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setTitle('Historie')
        .setDescription('Bottens historie')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Created", value: "21.08.23", inline: true},
            {name: "Updated", value: "26.08.23", inline: true},
            {name: "Embeds added", value: "26.08.23"},
        )
    await interaction.reply({ embeds: [embed]});
}