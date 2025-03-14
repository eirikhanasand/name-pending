import { Increment, Roles } from '../../../interfaces.js'
import config from '../../utils/config.js'
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction, 
    Role, 
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder
} from 'discord.js'
import getRepositories from '../../utils/gitlab/getRepositories.js'
import sanitize from '../../utils/sanitize.js'
import { FALLBACK_TAG, GITLAB_BASE, UNKNOWN_VERSION } from '../../../constants.js'
import getTags from '../../utils/gitlab/tags.js'
import getCommits from '../../utils/gitlab/getCommits.js'
import { errorButtons } from '../../utils/gitlab/buttons.js'
import formatCommits from '../../utils/gitlab/formatCommits.js'

export const data = new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploys a new version of a repository to staging.')
    .addStringOption((option) =>
        option
            .setName("repository")
            .setDescription(
                "Repository to deploy.",
            )
            .setRequired(true)
            .setAutocomplete(true),
    )
export async function execute(message: ChatInputCommandInteraction) {
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache
    .some((role: Role) => role.id === config.roleID || role.id === config.styret)
    const repository = sanitize(message.options.getString('repository') || "")
    let match = null as RepositorySimple | null
    const repositories = await getRepositories(25, repository)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: "Unauthorized.", ephemeral: true })
    }

    // Aborts if the channel isnt a playhouse channel
    if (!message.channel || !('name' in message.channel) || !message.channel.name?.toLocaleLowerCase().includes('playhouse')) {
        return await message.reply({ content: "This isnt a playhouse channel.", ephemeral: true })
    }

    // Aborts if no repository is selected
    if (!repository) {
        return await message.reply({ content: "No repository selected.", ephemeral: true })
    }

    // Tries to find a matching repository
    for (const repo of repositories) {
        if (repo.name === repository) {
            match = repo
        }
    }

    // Aborts if no matching repository exists
    if (!match) {
        return await message.reply({ content: `No repository matches '${repository}'.`, ephemeral: true })
    }

    const [version, commits] = await Promise.all([
        await getTags(match.id),
        await getCommits(match.id)
    ])
    const latestVersion = version[0] || FALLBACK_TAG

    const avatar = match.avatar_url || `${GITLAB_BASE}${match.namespace.avatar_url}`
    const embed = new EmbedBuilder()
        .setTitle(`Creating new deployment for ${match.name}.`)
        .setDescription(match.description || match.name)
        .setColor("#fd8738")
        .setTimestamp()
        .setThumbnail(avatar || null)
        .setURL(latestVersion.commit.web_url)
        .addFields([
            {name: "ID", value: String(match.id), inline: true},
            {name: "Branch", value: match.default_branch, inline: true},
            {name: "Last activity", value: new Date(match.last_activity_at).toLocaleString(), inline: true},
            {name: "Current version", value: latestVersion.name, inline: true},
            {name: "Commit", value: latestVersion.commit.short_id, inline: true},
            {name: "Created At", value: new Date(latestVersion.commit.created_at).toLocaleString(), inline: true},
            {name: "Title", value: latestVersion.commit.title},
            {name: "Author", value: latestVersion.commit.author_name, inline: true},
            {name: "Author Email", value: latestVersion.commit.author_email, inline: true},
            {name: "Recent commits", value: ' '},
            ...formatCommits(commits, 5)
        ])

    let buttons: ActionRowBuilder<ButtonBuilder>
    
    if (increment(latestVersion.name, Increment.MAJOR) !== UNKNOWN_VERSION) {
        // Creates 'major' button
        const major = new ButtonBuilder()
            .setCustomId('major')
            .setLabel(`Major (${increment(latestVersion.name, Increment.MAJOR)})`)
            .setStyle(ButtonStyle.Primary)

        // Creates 'minor' button
        const minor = new ButtonBuilder()
            .setCustomId('minor')
            .setLabel(`Minor (${increment(latestVersion.name, Increment.MINOR)})`)
            .setStyle(ButtonStyle.Primary)

        // Creates 'patch' button
        const patch = new ButtonBuilder()
            .setCustomId('patch')
            .setLabel(`Patch (${increment(latestVersion.name, Increment.PATCH)})`)
            .setStyle(ButtonStyle.Primary)

        // Creates 'trash' button
        const trash = new ButtonBuilder()
            .setCustomId('trash')
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Secondary)
        
        buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(major, minor, patch, trash)
    } else {
        buttons = errorButtons
    }

    await message.reply({ embeds: [embed], components: [buttons]})
}

function increment(version: string, type: Increment) {
    version = version === "No version released." ? "1.0.0" : version
    let versionParts = version.split('.').map(Number)

    if (isNaN(versionParts[2])) {
        versionParts[2] = Number(version.split('.')[2].split('-')[0]) ?? NaN
    }

    if (versionParts.length !== 3 || versionParts.some(isNaN)) {
        return UNKNOWN_VERSION
    }

    let [major, minor, patch] = versionParts

    switch (type) {
        case Increment.MAJOR:
            major += 1
            minor = 0
            patch = 0
            break
        case Increment.MINOR:
            minor += 1
            patch = 0
            break
        case Increment.PATCH:
            patch += 1
            break
        default:
            return UNKNOWN_VERSION
    }

    return `${major}.${minor}.${patch}`
}

/**
 * Recursively updates version numbers in package.json and package-lock.json.
 * @param dirPath - Directory to start the search.
 * @param newVersion - The new version string.
 */
// function updateVersionNumbers(dirPath: string, newVersion: string) {
//     const entries = readdirSync(dirPath, { withFileTypes: true })

//     for (const entry of entries) {
//         const fullPath = join(dirPath, entry.name)

//         if (entry.isDirectory()) {
//             updateVersionNumbers(fullPath, newVersion)
//         } else if (entry.name === 'package.json' || entry.name === 'package-lock.json') {
//             const fileContent = JSON.parse(readFileSync(fullPath, 'utf8'))
//             fileContent.version = newVersion
//             writeFileSync(fullPath, JSON.stringify(fileContent, null, 2))
//         }
//     }
// }
