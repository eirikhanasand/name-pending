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
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

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
    let match = null as Repository | null
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

    const embed = new EmbedBuilder()
        .setTitle(`Deploying vx.y.z of ${match.name}`)
        .setColor("#fd8738")
        .setTimestamp()

    await message.reply({ embeds: [embed]})
}

/**
 * Recursively updates version numbers in package.json and package-lock.json.
 * @param dirPath - Directory to start the search.
 * @param newVersion - The new version string.
 */
function updateVersionNumbers(dirPath: string, newVersion: string) {
    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
            updateVersionNumbers(fullPath, newVersion);
        } else if (entry.name === 'package.json' || entry.name === 'package-lock.json') {
            const fileContent = JSON.parse(readFileSync(fullPath, 'utf8'));
            fileContent.version = newVersion;
            writeFileSync(fullPath, JSON.stringify(fileContent, null, 2));
        }
    }
}
