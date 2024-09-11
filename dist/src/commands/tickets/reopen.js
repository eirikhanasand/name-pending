import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName('reopen')
    .setDescription('Reopens a ticket.');
export async function execute() {
    // Handled by handleComponents() in app.ts
    return;
}
