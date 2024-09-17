import { OverwriteType } from "discord.js";
export default async function manageRoles(interaction, ping, remove) {
    try {
        // Check if interaction has already been deferred
        if (!interaction.deferred) {
            await interaction.deferUpdate();
        }
        // Get the channel where the roles should be added
        const channel = interaction.channel;
        // Assuming interaction is of type RoleSelectMenuBuilder
        // @ts-expect-error
        const selectedRoles = interaction.values;
        if (selectedRoles.length === 0) {
            throw new Error('No roles selected.');
        }
        // Fetch the roles from the guild
        const guild = interaction.guild;
        if (!guild) {
            throw new Error('Guild not found.');
        }
        const possibleRoles = await Promise.all(selectedRoles.map((roleId) => guild.roles.fetch(roleId).catch(() => null)));
        const alreadyAddedRoles = channel.permissionOverwrites.cache.filter((overwrite) => overwrite.type === OverwriteType.Role).map((overwrite) => overwrite.id);
        const validRoles = possibleRoles.filter((role) => (role !== null
            && role.members.size <= 25
            && (remove
                ? alreadyAddedRoles.includes(role.id)
                : !alreadyAddedRoles.includes(role.id))));
        const totalMembers = validRoles.reduce((acc, role) => acc + role.members.size, 0);
        if ((!validRoles.length || totalMembers >= 25) && remove !== true) {
            if (ping === false) {
                // @ts-expect-error
                return interaction.channel?.send({
                    content: `The role${validRoles.length > 1 ? 's you selected are' : ' you selected is'} not allowed in tickets.`,
                });
            }
            else {
                // @ts-expect-error
                return interaction.channel?.send(`<@${interaction.user.id}> the role${possibleRoles.length > 1 ? 's you selected have' : ' you selected has'} too many members to be pinged. Try \`/addviewer\` instead to add without pinging.`);
            }
        }
        // Get the category of the channel and update its permissions
        const category = channel.parent;
        if (category) {
            const categoryOverwrites = category.permissionOverwrites;
            for (const role of validRoles) {
                if (remove !== true) {
                    // Adds the role to the category
                    await categoryOverwrites.edit(role, {
                        ViewChannel: true
                    });
                    // Adds the role to the channel
                    await channel.permissionOverwrites.edit(role, {
                        ViewChannel: true,
                        SendMessages: true,
                        AddReactions: true,
                        UseExternalEmojis: true,
                        ReadMessageHistory: true,
                    });
                }
                else {
                    // Fetche the bot to avoid removing the bot
                    const bot = guild.members.me;
                    if (bot?.roles.cache.has(role.id))
                        return;
                    const permissionOverwrites = channel.permissionOverwrites.cache.get(role.id);
                    if (permissionOverwrites) {
                        // Remove the permission overwrite for the role only if it exists
                        await channel.permissionOverwrites.delete(role.id);
                    }
                }
            }
        }
        const roleObjects = await Promise.all(await selectedRoles.map((roleId) => guild?.roles.fetch(roleId).catch(() => null)));
        const roleStrings = roleObjects.map((role) => role?.name);
        const roles = ping === undefined ? validRoles.join(', ') : roleStrings.join(', ');
        const content = remove
            ? `${interaction.user.username} removed ${roleStrings.join(', ')} from the ticket.`
            : `${interaction.user.username} added ${roles} to the ticket.`;
        // @ts-expect-error
        interaction.channel?.send({ content });
    }
    catch (err) {
        const error = err;
        // Handle errors appropriately
        if (error.name === 'InteractionAlreadyReplied') {
            console.warn('Interaction has already been replied to or deferred.');
        }
        else {
            console.error('Failed to update permissions:', error);
        }
    }
}
