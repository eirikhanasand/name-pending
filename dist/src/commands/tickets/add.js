import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds a member or role to a ticket.');
export async function execute() {
    // Handled by handleComponents() in app.ts
    return;
}
