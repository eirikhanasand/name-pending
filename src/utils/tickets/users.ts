import { 
    ButtonInteraction, 
    TextChannel, 
    CategoryChannel, 
    PermissionOverwriteManager, 
    User, 
    OverwriteType
} from "discord.js"

export default async function manageUsers(interaction: ButtonInteraction, ping?: false, remove?: true) {
    try {
        // Check if interaction has already been deferred
        if (!interaction.deferred) {
            await interaction.deferUpdate()
        }

        // Get the channel where the users should be added
        const channel = interaction.channel as TextChannel

        // Assuming interaction is of type RoleSelectMenuBuilder
        // @ts-expect-error
        const selectedUsers = interaction.values

        if (selectedUsers.length === 0) {
            throw new Error('No users selected.')
        }

        // Fetch the users from the guild
        const guild = interaction.guild
        if (!guild) {
            throw new Error('Guild not found.')
        }

        const users = await Promise.all(selectedUsers.map((userId: string) => guild.members.fetch(userId).catch(() => null)))
        const alreadyAddedUsers = channel.permissionOverwrites.cache.filter((overwrite) => overwrite.type === OverwriteType.Member).map((overwrite) => overwrite.id)
        const validUsers = users.filter((user: any) => user !== null && !alreadyAddedUsers.includes(user.id)) as User[]

        if (validUsers.length >= 25 && remove !== true) {
            // @ts-expect-error
            await interaction.channel?.send({
                content: `<@${interaction.user.id}> you can max add 25 users to a ticket at once.`,
            })
        }

        // Update channel permissions based on the users
        const permissionOverwrites = channel.permissionOverwrites as PermissionOverwriteManager

        for (const member of validUsers) {
            if (remove) {
                await channel.permissionOverwrites.delete(member.id)
            } else {
                await permissionOverwrites.edit(member, {
                    ViewChannel: true,
                    SendMessages: true,
                    AddReactions: true,
                    UseExternalEmojis: true,
                    ReadMessageHistory: true,
                })
            }
        }

        // Get the category of the channel and update its permissions
        const category = channel.parent as CategoryChannel
        if (category) {
            const categoryOverwrites = category.permissionOverwrites as PermissionOverwriteManager

            for (const member of validUsers) {
                await categoryOverwrites.edit(member, {
                    ViewChannel: true,
                })
            }
        }

        const content = remove 
            ? `${interaction.user.username} removed ${validUsers.map((user: User) => user.username).join(', ')} from the ticket.`
            : `${interaction.user.username} added ${validUsers.map((user: User) => ping === undefined ? `<@${user.id}>` : user.username).join(', ')} to the ticket.`
        // @ts-expect-error
        interaction.channel?.send({content})

    } catch (err) {
        const error = err as Error

        // Handle errors appropriately
        if (error.name === 'InteractionAlreadyReplied') {
            console.warn('Interaction has already been replied to or deferred.')
        } else {
            console.error('Failed to update permissions:', error)
        }
    }
}
