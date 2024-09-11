import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Fetches all your tickets.');
export async function execute() {
    // Handled by handleComponents() in app.ts
    return;
}
