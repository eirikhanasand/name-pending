import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js'
import getTotalLinks from '../../webarchive/getTotalLinks.js'
import { formatCooldown, readFile } from '../../webarchive/utils.js'

export const data = new SlashCommandBuilder()
    .setName('status')
    .setDescription('Status of how many domains are ready to be archived.')
export async function execute(message: ChatInputCommandInteraction) {
    const info = getTotalLinks()
    const stored = await readFile("data/status.txt")
    const cooldown = formatCooldown(stored.cooldown)
    const status = new EmbedBuilder()
        .setTitle('Status')
        .setDescription('Oversikt over linker klare til arkivering og eventuell cooldown.')
        .setColor("#fd8738")
        .setThumbnail("https://discord.ams3.cdn.digitaloceanspaces.com/tekkom-bot/webarchive/logo/logchive.jpg")
        .setTimestamp()
        .addFields(
            {name: "Total",     value: `${info.total}`,     inline: true },
            {name: "Cooldown",  value: `${cooldown}`,       inline: true },
            {name: " ",         value: " ",                 inline: false},
            {name: "Domains",   value: `${info.domains}`,   inline: true },
            {name: "Paths",     value: `${info.paths}`,     inline: true }
        )
    await message.reply({ embeds: [status]})
}
