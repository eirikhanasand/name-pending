import { ButtonInteraction, SlashCommandBuilder } from "discord.js"
import invite from "../../utils/tickets/invite.js"

export const data = new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Invites people to an open ticket that you are part of.')

export async function execute(interaction: ButtonInteraction) {
    invite(interaction)
}