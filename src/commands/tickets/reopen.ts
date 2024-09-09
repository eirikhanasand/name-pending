import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('reopen')
    .setDescription('Reopens existing ticket')
    .addStringOption((option) => option
        .setName('reason')
        .setDescription('Reason for reopening the ticket')
        .setName('new-victim')
        .setDescription('Add a new member to the role if necesarry, previous members will be added automatically')
    )

export async function execute(message: ChatInputCommandInteraction) {
    const victim = message.options.getString('victim')

    if (!victim) {
        await message.reply({content: "You need to specify a reason for reopening the ticket", ephemeral: true})
        return
    }

    reopen(message, victim)
}

async function reopen(message: ChatInputCommandInteraction,victim: string) {
    // Legger til medlem eller rolle til ticket, og pinger disse

    await message.reply({content: `Reopened`})
}