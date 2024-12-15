import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import config from '../../utils/config.js';
export const data = new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploys a new version of a repository to testing.');
export async function execute(message) {
    const isAllowed = message.member?.roles?.cache.some((role) => role.id === config.roleID || role.id === config.styret);
    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply({ content: "Unauthorized.", ephemeral: true });
    }
    const embed = new EmbedBuilder()
        .setTitle('Deploy')
        .setColor("#fd8738")
        .setTimestamp();
    await message.reply({ embeds: [embed] });
}
async function listRepositories(token) {
    const response = await fetch('https://gitlab.login.no/api/v4/projects?membership=true', {
        headers: { 'Private-Token': token },
    });
    if (!response.ok)
        throw new Error('Failed to fetch repositories');
    const repos = await response.json();
    return repos.map((repo) => repo.ssh_url_to_repo); // or .http_url_to_repo
}
/**
 * Recursively updates version numbers in package.json and package-lock.json.
 * @param dirPath - Directory to start the search.
 * @param newVersion - The new version string.
 */
function updateVersionNumbers(dirPath, newVersion) {
    const entries = readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        if (entry.isDirectory()) {
            updateVersionNumbers(fullPath, newVersion);
        }
        else if (entry.name === 'package.json' || entry.name === 'package-lock.json') {
            const fileContent = JSON.parse(readFileSync(fullPath, 'utf8'));
            fileContent.version = newVersion;
            writeFileSync(fullPath, JSON.stringify(fileContent, null, 2));
        }
    }
}
