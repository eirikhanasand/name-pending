import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('close')
    .setDescription('Closes ticket')
    .addStringOption((option) => option
        .setName('id')
        .setDescription('id of the ticket to close')
    )

export async function execute(message: ChatInputCommandInteraction) {
    const id = message.options.getString('id')

    if (!id) {
        await message.reply({content: "You need to specify which ticket to close", ephemeral: true})
        return
    }

    close(message, id)
}

function close(message: ChatInputCommandInteraction, id: string) {
    // Forespør motpart om å lukke ticket, og lukker hvis begge parter er enige
}