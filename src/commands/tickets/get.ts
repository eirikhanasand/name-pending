import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('get')
    .setDescription('Fetches all user tickets')

export async function execute(message: ChatInputCommandInteraction) {
    create(message)
}

async function create(message: ChatInputCommandInteraction) {
    await message.reply({content: "Created ticket"})
    // Funksjon som lager selve ticketen

    // Tittel
    // Kort info (blir stående i beskrivelsen til kanalen, maks 50 tegn.)
    // Beskrivelse
    // Rolle eller person som skal ha ticketen
}