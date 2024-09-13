import { 
    ButtonInteraction, 
    CategoryChannel, 
    OverwriteType, 
    PermissionOverwriteManager, 
    Role, 
    TextChannel 
} from "discord.js"

export default async function manageRoles(interaction: ButtonInteraction, ping?: false, remove?: true) {
    try {
        // Check if interaction has already been deferred
        if (!interaction.deferred) {
            await interaction.deferUpdate()
        }

        // Get the channel where the roles should be added
        const channel = interaction.channel as TextChannel

        // Assuming interaction is of type RoleSelectMenuBuilder
        // @ts-expect-error
        const selectedRoles = interaction.values

        if (selectedRoles.length === 0) {
            throw new Error('No roles selected.')
        }

        // Fetch the roles from the guild
        const guild = interaction.guild
        if (!guild) {
            throw new Error('Guild not found.')
        }

        const possibleRoles = await Promise.all(selectedRoles.map((roleId: string) => guild.roles.fetch(roleId).catch(() => null)))
        const alreadyAddedRoles = channel.permissionOverwrites.cache.filter((overwrite) => overwrite.type === OverwriteType.Role).map((overwrite) => overwrite.id)
        const validRoles = possibleRoles.filter((role: Role | null) => (role !== null && role.members.size <= 25 && !alreadyAddedRoles.includes(role.id))) as Role[]
        const totalMembers = validRoles.reduce((acc: number, role: Role) => acc + role.members.size, 0)

        if ((!validRoles.length || totalMembers >= 25) && remove !== true) {
            if (ping === false) {
                // @ts-expect-error
                return interaction.channel?.send({
                    content: `The role${validRoles.length > 1 ? 's you selected are' : ' you selected is'} not allowed in tickets.`,
                })
            } else {
                // @ts-expect-error
                return interaction.channel?.send(`<@${interaction.user.id}> the role${possibleRoles.length > 1 ? 's you selected have' : ' you selected has'} too many members to be pinged. Try \`/addviewer\` instead to add without pinging.`)
            }
        }

        // Update channel permissions based on the roles
        const permissionOverwrites = channel.permissionOverwrites as PermissionOverwriteManager
        const permission = remove ? false : true

        for (const role of validRoles) {
            await permissionOverwrites.edit(role, {
                ViewChannel: permission,
                SendMessages: permission,
                AddReactions: permission,
                UseExternalEmojis: permission,
                ReadMessageHistory: permission,
            })
        }

        // Get the category of the channel and update its permissions
        const category = channel.parent as CategoryChannel
        if (category) {
            const categoryOverwrites = category.permissionOverwrites as PermissionOverwriteManager

            for (const role of validRoles) {
                await categoryOverwrites.edit(role, {
                    ViewChannel: true,
                })
            }
        }

        const roleObjects = await Promise.all(
            await selectedRoles.map((roleId: string) => guild?.roles.fetch(roleId).catch(() => null))
        )
        const roleStrings = roleObjects.map((role: Role | null) => role?.name)
        const roles = ping === undefined ? validRoles.join(', ') : roleStrings.join(', ')

        const content = remove 
            ? `${interaction.user.username} removed ${roleStrings.join(', ')} from the ticket.`
            : `${interaction.user.username} added ${roles} to the ticket.`
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
