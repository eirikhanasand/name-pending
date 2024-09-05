export default function collect({ collector, guild, roles, icons }) {
    collector.on('collect', async (reaction, user) => {
        console.log("Collecting reaction");
        const member = await guild.members.fetch(user.id);
        const emoji = reaction._emoji.name;
        const reactionEmoji = emoji.length < 4 ? emoji.slice(0, 2).trim() : emoji.trim();
        for (let i = 0; i < icons.length; i++) {
            if (icons[i].trim() === reactionEmoji) {
                console.log("adding role");
                await member.roles.add(roles[i]);
                break;
            }
        }
    });
}
export function uncollect({ collector, guild, roles, icons }) {
    collector.on('remove', async (reaction, user) => {
        console.log("Collecting remove");
        const member = await guild.members.fetch(user.id);
        const emoji = reaction._emoji.name;
        const reactionEmoji = emoji.length < 4 ? emoji.slice(0, 2).trim() : emoji.trim();
        for (let i = 0; i < icons.length; i++) {
            if (icons[i].trim() === reactionEmoji) {
                console.log("removing role");
                await member.roles.remove(roles[i]);
                break;
            }
        }
    });
}
