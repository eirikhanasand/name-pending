import { EmbedBuilder } from "discord.js"
import { formatMillis } from "./utils.js"

export default function editEmbed(embed: any, stats: Stats) {
    const totalWeight = 4 * (stats.total_domains + stats.total_paths) + 200
    const completedWeight = stats.domains_in_fetch_progress.length + (stats.finished_domains * 3) + stats.paths_in_fetch_progress + (stats.finished_paths * 3) + stats.links_generated

    stats.progress = (completedWeight / totalWeight) * 100

    // Ensure progress is between 0 and 100
    stats.progress = Math.trunc(Math.min(100, Math.max(0, stats.progress)))
    
    switch (stats.status) {
        case "Working":
        case "Starting": return embed.edit({ embeds: [startingEmbed(stats)]})
        case "Fetching": return embed.edit({ embeds: [fetchingEmbed(stats)]})
        case "Archiving": return embed.edit({ embeds: [archivingEmbed(stats)]})
        case "Finished": return embed.edit({ embeds: [finishedEmbed(stats)]})
        default: return console.log("Invalid embed or status.")
    }
}

export function startingEmbed(stats: Stats) {
    const currentTime = new Date()
    const millis = formatMillis(currentTime.getTime() - stats.startTime)
    const embed = new EmbedBuilder()
        .setTitle('Archive')
        .setDescription('Arkiverer hele Logins digitale fotavtrykk i sanntid.')
        .setColor("#fd8738")
        .setThumbnail("https://discord.ams3.cdn.digitaloceanspaces.com/tekkom-bot/webarchive/logo/logchive.jpg")
        .setTimestamp()
        .addFields(
            {name: "Total", value: `${stats.total}`, inline: true},
            {name: "Time elapsed", value: `${millis}`, inline: true},
            {name: "Status", value: `${stats.status}, ${stats.progress}%`, inline: true},
            {name: " ", value: " "},
            {name: "Domains", value: `${stats.total_domains}`, inline: true},
            {name: "Paths", value: `${stats.total_paths}`, inline: true},
        )

    return embed
}

export function cooldownEmbed(cooldown: number) {
    const embed = new EmbedBuilder()
        .setTitle('Archive')
        .setDescription('Arkiverer hele Logins digitale fotavtrykk i sanntid.')
        .setColor("#fd8738")
        .setThumbnail("https://discord.ams3.cdn.digitaloceanspaces.com/tekkom-bot/webarchive/logo/logchive.jpg")
        .setTimestamp()
        .addFields(
            {name: "Cooldown", value: `${cooldown}`},
        )
    
    return embed
}

export function archivingEmbed(stats: Stats) {
    const currentTime = new Date()
    const millis = formatMillis(currentTime.getTime() - stats.startTime)
    const domainsFailed = stats.total_domains - stats.finished_domains - stats.domains_in_progress.length
    const pathsFailed = stats.total_paths - stats.finished_paths - stats.paths_in_progress
    const embed = new EmbedBuilder()
        .setTitle('Archive')
        .setDescription('Arkiverer hele Logins digitale fotavtrykk i sanntid.')
        .setColor("#fd8738")
        .setThumbnail("https://discord.ams3.cdn.digitaloceanspaces.com/tekkom-bot/webarchive/logo/logchive.jpg")
        .setTimestamp()
        .addFields(
            {name: "Total", value: `${stats.total}`, inline: true},
            {name: "Time elapsed", value: `${millis}`, inline: true},
            {name: "Status", value: `${stats.status}, ${stats.progress}%`, inline: true},
            {name: " ", value: " "},
            {name: "Domains", value: `${stats.total_domains}`, inline: true},
            {name: "Finished", value: `${stats.finished_domains}`, inline: true},
            {name: "Failed", value: `${domainsFailed > 0 ? domainsFailed : 0}`, inline: true},
            {name: " ", value: " "},
            {name: "Paths", value: `${stats.total_paths}`, inline: true},
            {name: "Finished", value: `${stats.finished_paths}`, inline: true},
            {name: "Failed", value: `${pathsFailed > 0 ? pathsFailed : 0}`, inline: true},
            {name: " ", value: " "},
            {name: "Archiving", value: " "},
            {name: "Domains in progress", value: `${stats.domains_in_progress.length}`, inline: true},
            {name: "Paths in progress", value: `${stats.paths_in_progress}`, inline: true},
            {name: " ", value: " "},
            {name: "Domains archived", value: `${stats.finished_domains}`, inline: true},
            {name: "Domains archiving", value: `${stats.domains_in_archive_progress.length}`, inline: true},
            {name: "Domains in queue", value: `${stats.domains_in_archive_queue.length}`, inline: true},
            {name: " ", value: " "},
            {name: "Paths archived", value: `${stats.finished_paths}`, inline: true},
            {name: "Paths archiving", value: `${stats.paths_in_archive_progress.length}`, inline: true},
            {name: "Paths in queue", value: `${stats.paths_in_archive_queue.length}`, inline: true}
        )
    
    return embed
}

export function fetchingEmbed(stats: Stats) {
    const currentTime = new Date()
    const millis = formatMillis(currentTime.getTime() - stats.startTime)
    const embed = new EmbedBuilder()
        .setTitle('Archive')
        .setDescription('Arkiverer hele Logins digitale fotavtrykk i sanntid.')
        .setColor("#fd8738")
        .setThumbnail("https://discord.ams3.cdn.digitaloceanspaces.com/tekkom-bot/webarchive/logo/logchive.jpg")
        .setTimestamp()
        .addFields(
            {name: "Total URLs", value: `${stats.total}`, inline: true},
            {name: "Time elapsed", value: `${millis}`, inline: true},
            {name: "Status", value: `${stats.status}, ${stats.progress}%`, inline: true},
            {name: " ", value: " "},
            {name: "Total domains", value: `${stats.total_domains}`, inline: true},
            {name: "Total paths", value: `${stats.total_paths}`, inline: true},
            {name: " ", value: " "},
            {name: "Domains failed", value: `${stats.total_domains - stats.finished_domains - stats.domains_in_progress.length}`, inline: true},
            {name: "Paths failed", value: `${stats.total_paths - stats.finished_paths - stats.paths_in_progress}`, inline: true},
            {name: " ", value: " "},
            {name: "Fetching", value: " "},
            {name: "Domains in progress", value: `${stats.domains_in_progress.length}`, inline: true},
            {name: "Paths in progress", value: `${stats.paths_in_progress}`, inline: true},
            {name: " ", value: " "},
            {name: "Domains fetched", value: `${stats.domains_in_archive_queue.length}`, inline: true},
            {name: "Domains fetching", value: `${stats.domains_in_fetch_progress.length}`, inline: true},
            {name: "Domains in queue", value: `${stats.domains_in_fetch_queue.length}`, inline: true},
            {name: " ", value: " "},
            {name: "Paths fetched", value: `${stats.paths_in_archive_queue.length}`, inline: true},
            {name: "Paths fetching", value: `${stats.paths_in_fetch_progress}`, inline: true},
            {name: "Paths in queue", value: `${stats.paths_in_fetch_queue}`, inline: true}
        )
    
    return embed
}

export function finishedEmbed(stats: Stats) {
    const currentTime = new Date()
    const cooldown = new Date()
    const millis = formatMillis(currentTime.getTime() - stats.startTime)
    cooldown.setMinutes(cooldown.getMinutes() + 45)

    const embed = new EmbedBuilder()
        .setTitle('Archive')
        .setDescription('Arkiverer hele Logins digitale fotavtrykk i sanntid.')
        .setColor("#fd8738")
        .setThumbnail("https://discord.ams3.cdn.digitaloceanspaces.com/tekkom-bot/webarchive/logo/logchive.jpg")
        .setTimestamp()
        .addFields(
            {name: "Finished Archiving", value: " "},
            {name: "Attempted urls", value: `${stats.total}`, inline: true},
            {name: "Time elapsed", value: `${millis}`, inline: true},
            {name: "Status", value: `${stats.status}`, inline: true},
            {name: " ", value: " "},
            {name: "Domains attempted", value: `${stats.total_domains}`, inline: true},
            {name: "Domains archived", value: `${stats.finished_domains}`, inline: true},
            {name: "Domains failed", value: `${stats.domains_failed}`, inline: true},
            {name: " ", value: " "},
            {name: "Paths attempted", value: `${stats.total_paths + stats.links_generated}`, inline: true},
            {name: "Paths archived", value: `${stats.finished_paths}`, inline: true},
            {name: "Paths failed", value: `${stats.links_failed}`, inline: true},
            {name: " ", value: " "},
            {name: "Cooldown", value: `${cooldown}`, inline: true},
            {name: "Archived by", value: `${stats.author}`, inline: true},
            {name: "Links generated", value: `${stats.links_generated}`, inline: true},
        )
    
    return embed
}