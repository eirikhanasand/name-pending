import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes a user or role from the ticket.');
export async function execute() {
    // Handled by handleComponents() in app.ts
    return;
}
