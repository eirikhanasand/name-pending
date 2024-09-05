export default function addRole({ collector, guild, roles, icons }) {
    collector.on('collect', async (reaction, user) => {
        const member = await guild.members.fetch(user.id);
        const emoji = reaction._emoji.name;
        const reactionEmoji = emoji.length < 4 ? emoji.slice(0, 2).trim() : emoji.trim();
        for (let i = 0; i < icons.length; i++) {
            if (icons[i].trim() === reactionEmoji) {
                await member.roles.add(roles[i]);
                break;
            }
        }
    });
}
export async function removeRole({ reaction, user }) {
    // @ts-expect-error
    const content = reaction.message.embeds[0].data.fields[0].value;
    const roleRegex = /<@&(\d+)>/g;
    const messageRoles = content.match(roleRegex) || [];
    const roleIds = messageRoles.map((match) => match.slice(3, -1));
    const icons = content.split('\n').map((icon) => icon[1] === ':' ? icon.split(':')[1] : icon.substring(0, 2));
    const emoji = reaction._emoji.name;
    const reactionEmoji = emoji.length < 4 ? emoji.slice(0, 2).trim() : emoji.trim();
    for (let i = 0; i < icons.length; i++) {
        if (icons[i].trim() === reactionEmoji) {
            try {
                // Fetches the member from the guild
                // @ts-expect-error
                const member = await reaction.message.guild.members.fetch(user.id);
                // Removees the role from the member
                if (member && roleIds[i]) {
                    await member.roles.remove(roleIds[i]);
                }
                else {
                    console.error('Member or role ID not found');
                }
            }
            catch (error) {
                console.error('Error removing role:', error);
            }
            break;
        }
    }
}
