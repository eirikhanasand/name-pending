import { Roles } from '../../../interfaces.js'
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
import getRepositories from '../../utils/getRepositories.js'
import sanitize from '../../utils/sanitize.js'
import { FALLBACK_TAG, GITLAB_BASE, UNKNOWN_VERSION } from '../../../constants.js'
import getTags from '../../utils/getTags.js'
import getCommits from '../../utils/getCommits.js'

enum Increment {
    MAJOR,
    MINOR,
    PATCH
}

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

    const avatar = `${GITLAB_BASE}${match.avatar_url || match.namespace.avatar_url}`
    const embed = new EmbedBuilder()
        .setTitle(`Creating new deployment for ${match.name}.`)
        .setDescription(match.description)
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
        // Creates 'error' button
        const error = new ButtonBuilder()
            .setCustomId('error')
            .setLabel('Last tag does not follow x.y.z format, fix manually.')
            .setStyle(ButtonStyle.Danger)

        // Creates 'trash' button
        const trash = new ButtonBuilder()
            .setCustomId('trash')
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Secondary)
        
        buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(error, trash)
    }

    await message.reply({ embeds: [embed], components: [buttons]})
}

function increment(version: string, type: Increment) {
    const versionParts = version.split('.').map(Number)

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

function formatCommits(commits: Commit[], count: number) {
    let authors = ""
    let timestamps = "11.21.24, 5:48 PM\n11.21.24, 5:48 PM\n11.21.24, 5:48 PM\n11.21.24, 5:48 PM\n11.21.24, 5:48 PM"
    let descriptions = ""

    let i = 0
    while (commits && i < count) {
        authors += `${commits[i].short_id}, ${commits[i].author_name}\n`
        const created = new Date(commits[i].created_at)
        const year = String(created.getFullYear()).slice(2)
        const day = created.getDate()
        const month = created.getMonth() + 1
        const hour = created.getHours()
        const minute = created.getMinutes()
        const localeString = created.toLocaleString()
        const meridian = localeString.slice(localeString.length - 2, localeString.length)
        const formatDate = `${day}.${month}.${year}, ${hour}:${minute} ${meridian}`
        const description = `${formatDate}, ${commits[i].title}`
        descriptions += `${description.slice(0, 42).trim()}${description.length > 42 ? '…' : ''}\n`
        i++
    }

    return [
        {name: "Commit\tAuthor", value: authors, inline: true},
        {name: "Info", value: descriptions, inline: true}
    ]
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
