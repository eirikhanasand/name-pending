import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Creates a ticket')
    .addStringOption(option =>
		option
			.setName('breed')
			.setDescription('Breed of dog')
    )

export async function execute(message: ChatInputCommandInteraction) {
    create(message)
}

async function create(message: ChatInputCommandInteraction) {
    await message.reply({content: "Created ticket"})

    // get started
    // - create ticket
    // - view tickets
    // - tag ticket
    // - close ticket

    // Funksjon som lager selve ticketen

    // Tittel
    // Kort info (blir stående i beskrivelsen til kanalen, maks 50 tegn.)
    // Beskrivelse
    // Rolle eller person som skal ha ticketen

    // Info om hvordan man lager ticket, baseknapp i opplegget
    // Meny med knapp

    // Spawner deretter en meny med flere valg:
    // - Hvordan lage ticket
    // - Hvordan tagge ticket
    // - Hvordan arkivere ticket
    // - Hvordan lage ticket fra eksisterende kanal
    // - Hvordan hente info fra ticket
    // - Hvordan lukke ticket
    // - Hvordan se alle tickets
    // - Hvordan se alle tickets fra en person
    // - Hvordan se alle tickets med en tag
    // - Hvordan se alle tickets uten tag
    // - Hvordan se alle tickets som er lukket
    // - Hvordan se alle tickets som er åpne
    // - Hvordan se alle tickets som er arkiverte
    // - Hvordan se alle tickets som er ikke arkiverte
    // - Hvordan se alle tickets som er tagget med en tag
    // - Hvordan se alle tickets som er ikke tagget med en tag
    // - Hvordan se alle tickets som er tagget med en tag
    // - Hvordan se alle tickets som er ikke tagget med en tag
    // - Hvordan se alle tickets som er tagget med en tag
}