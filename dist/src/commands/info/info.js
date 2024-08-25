import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Info regarding the bot.');
export async function execute(message) {
    const embed = new EmbedBuilder()
        .setTitle('Info')
        .setDescription('The main task of this bot is assisting with management of Logins Discord server. It handles roles, minecraft related tasks such as whitelisting and chat mirroring, sending notifications to the app, info about infrastructure related management such as registry and tag info, as well as other miscellaneous tasks.')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields({ name: "Created", value: "21.08.23", inline: true }, { name: "Updated", value: "09.06.24", inline: true }, { name: " ", value: " ", inline: false });
    await message.reply({ embeds: [embed] });
}
