import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import getTotalLinks from '../../webarchive/getTotalLinks.js';
import { archiveURLs } from '../../webarchive/handleURL.js';
import { readFile } from '../../webarchive/utils.js';
import { cooldownEmbed } from '../../webarchive/embeds.js';
export const data = new SlashCommandBuilder()
    .setName('archive')
    .setDescription('Archives all of Logins webpages in real time.');
export async function execute(message) {
    const currentTime = new Date();
    const stored = readFile("./data/status.txt");
    const cooldown = stored.cooldown - currentTime;
    const info = getTotalLinks();
    if (cooldown > 0)
        return await message.reply({ embeds: [cooldownEmbed(cooldown)] });
    // start stats section
    const stats = {
        total: info.total,
        total_domains: info.domains,
        total_paths: info.paths,
        finished_domains: 0,
        finished_paths: 0,
        domains_failed: 0,
        links_failed: 0,
        paths_in_archive_progress: [],
        paths_in_archive_queue: [],
        domains_in_archive_progress: [],
        domains_in_archive_queue: [],
        domains_in_progress: [],
        domains_in_queue: [],
        paths_in_progress: 0,
        paths_in_queue: 0,
        domains_in_fetch_progress: [],
        domains_in_fetch_queue: [],
        paths_in_fetch_progress: 0,
        paths_in_fetch_queue: 0,
        progress: 0,
        status: "Starting",
        startTime: new Date(),
        author: message.user.username,
        links_generated: 0
    };
    // end stats section
    const embed = new EmbedBuilder()
        .setTitle('Archive')
        .setDescription('Arkiverer hele Logins digitale fotavtrykk i sanntid.')
        .setColor("#fd8738")
        .setThumbnail("https://discord.ams3.cdn.digitaloceanspaces.com/tekkom-bot/webarchive/logo/logchive.jpg")
        .setTimestamp()
        .addFields({ name: "Total", value: `${info.total}`, inline: true }, { name: "Time elapsed", value: "00:00", inline: true }, { name: " ", value: " ", inline: false }, { name: "Domains", value: `${info.domains}`, inline: true }, { name: "Paths", value: `${info.paths}`, inline: true });
    const response = await message.reply({ embeds: [embed] });
    await archiveURLs(response, stats);
}
