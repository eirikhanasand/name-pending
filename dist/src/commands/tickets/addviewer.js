import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder()
    .setName('addviewer')
    .setDescription('Adds a member or role to a ticket without pinging them.');
export async function execute() {
    // Handled by handleComponents() in app.ts
    return;
}
