import { SlashCommandBuilder } from 'discord.js';
import config from '../../utils/config.js';
import { schedule } from 'node-cron';
import autoCreate from '../../utils/wiki.js';
export const data = new SlashCommandBuilder()
    .setName('meeting')
    .setDescription('Creates an agenda in the wiki.')
    .addStringOption((option) => option
    .setName('interval')
    .setDescription('* * * * * format')
    .setRequired(true));
export async function execute(message) {
    const isAllowed = message.member?.roles?.cache.some((role) => role.id === config.roleID);
    if (!isAllowed) {
        return await message.reply("Unauthorized.");
    }
    const interval = message.options.getString('interval');
    if (!interval) {
        return await message.reply('Interval is required.');
    }
    await message.reply(`Interval set to ${interval}.`);
    schedule(interval, () => autoCreate(false));
}
