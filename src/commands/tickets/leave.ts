import { 
    ChatInputCommandInteraction, 
    PermissionOverwriteManager, 
    SlashCommandBuilder, 
    TextChannel
} from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Leaves the ticket.')

export async function execute(message: ChatInputCommandInteraction) {
    const user = message.user
    const channel = message.channel as TextChannel
    const permissionOverwrites = channel.permissionOverwrites as PermissionOverwriteManager

    if (!channel.name.match(/ticket\d+/)) {
        return await message.reply({
            content: "This is not a ticket!",
            ephemeral: true
        })
    }

    // Removes the authors permission to be in the channel
    await permissionOverwrites.delete(user.id)

    // Lets the people in the channel know that someone left.
    channel.send(`${message.user.username} left the ticket.`)

    return
}
