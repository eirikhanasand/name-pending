import { Roles } from '../../interfaces.js'
import config from '../../utils/config.js'
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction, 
    Role,
    Message
} from 'discord.js'
import getRepositories from '../../utils/gitlab/getRepositories.js'
import sanitize from '../../utils/sanitize.js'
import getOpenMergeRequests from '../../utils/gitlab/getMergeRequests.js'
import { FALLBACK_TAG, GITLAB_BASE, INFRA_PROD_CLUSTER } from '../../constants.js'
import getTags, { postTag } from '../../utils/gitlab/tags.js'
import formatCommits from '../../utils/gitlab/formatCommits.js'
import getCommits from '../../utils/gitlab/getCommits.js'
import editEverySecondTillDone from '../../utils/gitlab/editEverySecondTillDone.js'
import formatVersion from '../../utils/gitlab/formatVersion.js'
import postMerge from '../../utils/gitlab/postMerge.js'

type HandleMergeProps = {
    sorted: MergeRequest[]
    willMerge: MergeRequest[]
    repository: string
    tag: string
    finalResponse: Message<boolean>
}

export const data = new SlashCommandBuilder()
    .setName('release')
    .setDescription('Releases a new version of a repository to production.')
    .addStringOption((option) =>
        option
            .setName("repository")
            .setDescription(
                "Repository to release.",
            )
            .setRequired(true)
            .setAutocomplete(true),
    )

export async function execute(message: ChatInputCommandInteraction) {
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache
    .some((role: Role) => role.id === config.roleID || role.id === config.styret)
    const repository = sanitize(message.options.getString('repository') || '')
    let match = null as RepositorySimple | null
    const repositories = await getRepositories(25, repository)
    const interval = 1

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: "Unauthorized.", ephemeral: true })
    }

    // Aborts if the channel isnt a operations channel
    if (!message.channel || !('name' in message.channel) || !message.channel.name?.toLocaleLowerCase().includes('operations')) {
        return await message.reply({ content: "This isnt a operations channel.", ephemeral: true })
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

    const tags = await getTags(match.id)
    let error

    // Sets error to unable to fetch tags
    if (!Array.isArray(tags)) {
        error = `Unable to fetch tags for ${match.name}. Please try again later.`
    }

    const baseTag = tags[0]
    const baseName = baseTag.name
    // Sets error to tag already deployed
    if (!baseName.includes('-dev')) {
        error = `Tag ${baseName} for ${match.name} is already deployed.\nPlease use \`\/deploy\` first.`
    }

    // Aborts if there is an error
    if (error) {
        const embed = new EmbedBuilder()
        .setTitle(error)
        .setColor("#fd8738")
        .setTimestamp()

        return message.reply({ embeds: [embed], ephemeral: true})
    }

    const [version, commits] = await Promise.all([
        await getTags(match.id),
        await getCommits(match.id)
    ])
    const latestVersion = version[0] || FALLBACK_TAG
    const tag = baseTag.name.includes('-dev') ? baseTag.name.slice(0, baseTag.name.length - 4) : baseTag.name
    const avatar = match.avatar_url || `${GITLAB_BASE}${match.namespace.avatar_url}`
    const embed = new EmbedBuilder()
        .setTitle(`Releasing v${tag} for ${repository}.`)
        .setDescription(match.description || ' ')
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
            {name: "Recent commits", value: ' '},
            ...formatCommits(commits, 5)
        ])

    await message.reply({ embeds: [embed]})
    const response = await message.fetchReply()
    await postTag(match.id, tag)
    const result = await editEverySecondTillDone(response, message.user.username, match.id, tag, repository, interval, true)

    // Waiting for editEverySecondTo complete last iteration
    await new Promise(resolve => setTimeout(resolve, (interval * 1000) + 25))
    const finalResponse = await message.fetchReply()

    if (result) {
        const mergeRequests = await getOpenMergeRequests(INFRA_PROD_CLUSTER)
        const relevant: MergeRequest[] = []
        const willMerge: MergeRequest[] = []
        
        for (const mr of mergeRequests) {
            const match = mr.title.match(/registry\.login\.no.*\/([^\/\s]+)\s/)
                
            if (match) {
                const normalizedQuery = repository.toLowerCase()
                if (match[1] === normalizedQuery) {
                    relevant.push(mr)
                } else {
                    const match1 = match[1].replaceAll('-', '')
                    const broadMatch = match1.replaceAll(' ', '')
                    const query1 = normalizedQuery.replaceAll('-', '')
                    const broadNormalizedQuery = query1.replaceAll(' ', '')
                    
                    if (broadMatch === broadNormalizedQuery) {
                        relevant.push(mr)
                    }
                }
            }
        }

        const sorted = relevant.sort((a, b) => {
            const versionA = formatVersion(a.title)
            const versionB = formatVersion(b.title)
        
            for (let i = 0; i < 3; i++) {
                const partA = versionA[i]
                const partB = versionB[i]
                if (partA !== partB) {
                    return partB - partA
                }
            }

            return 0
        })

        handleMerge({sorted, willMerge, repository, tag, finalResponse})
    }
}

async function handleMerge({sorted, willMerge, repository, tag, finalResponse}: HandleMergeProps) {
    if (sorted.length) {
        const highestVersion = formatVersion(sorted[0].title)
        for (const mr of sorted) {
            if (formatVersion(mr.title).join('.') === highestVersion.join('.')) {
                willMerge.push(mr)
            }
        }

        const result = await merge(willMerge)

        let success = 0
        for (const req of result) {
            if (req.state === "merged") {
                success++
            }
        }

        if (result.length === success) {
            const final = new EmbedBuilder()
                .setTitle(`Released ${repository} v${tag} to production.`)
                .setColor("#fd8738")
                .setTimestamp()
            finalResponse.edit({embeds: [...finalResponse.embeds, final]})
        } else {
            const final = new EmbedBuilder()
                .setTitle(`Failed to release ${repository} v${tag} to production.`)
                .setDescription('An error occured while merging. Please resolve manually.')
                .setColor("#fd8738")
                .setTimestamp()
            finalResponse.edit({embeds: [...finalResponse.embeds, final]})
            console.error(`Failed while merging merge requests for ${repository} v${tag}. Please merge remaining MRs manually.`)
        }
    } else {
        const final = new EmbedBuilder()
            .setTitle(`Found no merge requests for ${repository} v${tag}. Please merge manually.`)
            .setDescription('An error occured while merging. Please resolve manually.')
            .setColor("#fd8738")
            .setTimestamp()
        finalResponse.edit({embeds: [...finalResponse.embeds, final]})
        console.error(`Found no merge requests for ${repository} v${tag}. Please merge manually.`)
    }
}

async function merge(requests: MergeRequest[]) {
    const responses = []
    for (const request of requests) {
        responses.push(await postMerge(request.iid))
    }

    return responses
}
