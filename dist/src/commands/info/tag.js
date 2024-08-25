import { SlashCommandBuilder } from 'discord.js';
export const data = new SlashCommandBuilder()
    .setName('tag')
    .setDescription('Replies with info on how to tag an image');
export async function execute(message) {
    await message.reply('```js\ngit add .\ngit commit -m "melding"\ngit tag -a <version> -m "melding" <commit_hash>\ngit push origin <version>\ngit push```');
}
