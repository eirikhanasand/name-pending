import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJsonPath = join(__dirname, '../../../package.json')
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

export const data = new SlashCommandBuilder()
    .setName('version')
    .setDescription(`Current version of the bot. (v${packageJson.version})`)
export async function execute(message: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
        .setTitle(`Version ${packageJson.version}`)
        .setColor("#fd8738")
        .setTimestamp()
    await message.reply({ embeds: [embed]})
}
