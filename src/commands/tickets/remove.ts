import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('remove')
    .setDescription('Removes member or role from the ticket')
    .addStringOption((option) => option
        .setName('victim')
        .setDescription('Member or role to remove from the ticket')
    )

export async function execute(message: ChatInputCommandInteraction) {
    const victim = message.options.getString('victim')

    if (!victim) {
        await message.reply({content: "You need to specify the member or role to remove from the ticket", ephemeral: true})
        return
    }

    remove(message, victim)
}

async function remove(message: ChatInputCommandInteraction,victim: string) {
    // Fjerner medlem eller rolle til ticket

    await message.reply({content: `Removed ${victim} from the ticket`})
}