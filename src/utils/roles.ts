import { Guild, Reaction, ReactionCollector, User } from "discord.js"

type CollectProps = {
    collector: ReactionCollector
    guild: Guild
    roles: string[]
    icons: string[]
}

export default function addRole({collector, guild, roles, icons}: CollectProps) {
    collector.on('collect', async (reaction: Reaction, user: User) => {
        const member = await guild.members.fetch(user.id)
        const emoji = reaction._emoji.name
        const reactionEmoji = emoji.length < 4 ? emoji.slice(0, 2).trim() : emoji.trim()
        
        for (let i = 0; i < icons.length; i++) {
            if (icons[i].trim() === reactionEmoji) {
                await member.roles.add(roles[i])
                break
            }
        }
    })
}

export function removeRole({collector, guild, roles, icons}: CollectProps) {
    collector.on('remove', async (reaction: Reaction, user: User) => {
        const member = await guild.members.fetch(user.id)
        const emoji = reaction._emoji.name
        const reactionEmoji = emoji.length < 4 ? emoji.slice(0, 2).trim() : emoji.trim()

        for (let i = 0; i < icons.length; i++) {
            if (icons[i].trim() === reactionEmoji) {
                await member.roles.remove(roles[i])
                break
            }
        }
    })
}
