import { Roles } from '../../../interfaces.js'
import config from '../../utils/config.js'
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction, 
    Role 
} from 'discord.js'
import getRepositories from '../../utils/getRepositories.js'
import sanitize from '../../utils/sanitize.js'
import getOpenMergeRequests from '../../utils/getMergeRequests.js'
import { INFRA_PROD_CLUSTER } from '../../../constants.js'

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
    .addStringOption((option) =>
        option
            .setName("version")
            .setDescription(
                "Version to release.",
            )
            .setRequired(true)
            .setAutocomplete(true),
    )

export async function execute(message: ChatInputCommandInteraction) {
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache
    .some((role: Role) => role.id === config.roleID || role.id === config.styret)
    const repository = sanitize(message.options.getString('repository') || "")
    const version = sanitize(message.options.getString('version') || "")
    let foundRepo = null as RepositorySimple | null
    let foundMR = null as any | null
    const repositories = await getRepositories(25, repository)
    const mergeRequests = await getOpenMergeRequests(INFRA_PROD_CLUSTER)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: "Unauthorized.", ephemeral: true })
    }

    // Aborts if no repository is selected
    if (!repository) {
        return await message.reply({ content: "No repository selected.", ephemeral: true })
    }

    // Aborts if no MR is selected
    if (!version) {
        return await message.reply({ content: "No version selected.", ephemeral: true })
    }

    // Tries to find a matching repository
    for (const repo of repositories) {
        if (repo.name === repository) {
            foundRepo = repo
        }
    }

    for (const mr of mergeRequests) {
        if (mr.title.includes(version)) {
            foundMR = mr
        }
    }

    // Aborts if no matching repository exists
    if (!foundRepo) {
        return await message.reply({ content: `No repository matches '${repository}'.`, ephemeral: true })
    }

    // Aborts if no matching merge request exists
    if (!foundMR) {
        return await message.reply({ content: `No version matches '${version}'.`, ephemeral: true })
    }

    const embed = new EmbedBuilder()
        .setTitle(`Releasing v${version} of ${foundRepo.name}`)
        .setColor("#fd8738")
        .setTimestamp()

    await message.reply({ embeds: [embed]})
}
