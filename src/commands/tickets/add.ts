import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds member or role to the ticket')
    .addStringOption((option) => option
        .setName('victim')
        .setDescription('Member or role to add to the ticket')
    )

export async function execute(message: ChatInputCommandInteraction) {
    const victim = message.options.getString('victim')

    if (!victim) {
        await message.reply({content: "You need to specify a member or role to add to the ticket", ephemeral: true})
        return
    }

    add(message, victim)
}

async function add(message: ChatInputCommandInteraction,victim: string) {
    // Legger til medlem eller rolle til ticket, og pinger disse

    await message.reply({content: `Added ${victim} to the ticket`})
}