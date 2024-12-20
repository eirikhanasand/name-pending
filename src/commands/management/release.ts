import { Roles } from '../../../interfaces.js'
import config from '../../utils/config.js'
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction, 
    Role, 
} from 'discord.js'
import getRepositories from '../../utils/gitlab/getRepositories.js'
import sanitize from '../../utils/sanitize.js'
import getOpenMergeRequests from '../../utils/gitlab/getMergeRequests.js'
import { FALLBACK_TAG, GITLAB_API, GITLAB_BASE, INFRA_PROD_CLUSTER } from '../../../constants.js'
import getTags, { postTag } from '../../utils/gitlab/tags.js'
import formatCommits from '../../utils/gitlab/formatCommits.js'
import getCommits from '../../utils/gitlab/getCommits.js'
import editEverySecondTillDone from '../../utils/gitlab/editEverySecondTillDone.js'
import formatVersion from '../../utils/gitlab/formatVersion.js'

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

    const tags = await getTags(match.id)
    let error

    if (!Array.isArray(tags)) {
        error = `Unable to fetch tags for ${match.name}. Please try again later.`
    }

    const baseTag = tags[0]
    const baseName = baseTag.name
    // if (!baseName.includes('-dev')) {
    //     error = `Tag ${baseName} for ${match.name} is already deployed.\nPlease use \`\/deploy\` first.`
    // }

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
    const avatar = `${GITLAB_BASE}${match.avatar_url || match.namespace.avatar_url}`
    const embed = new EmbedBuilder()
        .setTitle(`Releasing v${tag} for ${repository}.`)
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

    await message.reply({ embeds: [embed]})
    const response = await message.fetchReply()
    await postTag(match.id, tag)
    const result = await editEverySecondTillDone(response, message.user.username, match.id, tag, repository, 1, true)

    if (result) {
        const mergeRequests = await getOpenMergeRequests(INFRA_PROD_CLUSTER)
        const relevant: MergeRequest[] = []
        const willMerge: MergeRequest[] = []
        
        for (const mr of mergeRequests) {
            if (mr.title.includes(repository)) {
                relevant.push(mr)
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
            response.edit({embeds: [...response.embeds, final]})
        } else {
            const final = new EmbedBuilder()
                .setTitle(`Failed to release ${repository} v${tag} to production.`)
                .setDescription('An error occured while merging. Please resolve manually.')
                .setColor("#fd8738")
                .setTimestamp()
            response.edit({embeds: [...response.embeds, final]})
        }
    }
}

async function merge(requests: MergeRequest[]) {
    const responses = []
    for (const request of requests) {
        responses.push(await postMerge(request.iid))
    }

    return responses
}

async function postMerge(id: number) {
    try {
        console.warn("Merging", `${GITLAB_API}projects/${INFRA_PROD_CLUSTER}/merge_requests/${id}`)
        const response = await fetch(`${GITLAB_API}projects/${INFRA_PROD_CLUSTER}/merge_requests/${id}/merge`, {
            method: 'PUT',
            headers: {
                'Private-Token': config.privateToken
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
    }
}
