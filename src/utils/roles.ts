import { Guild, Reaction, ReactionCollector, User } from "discord.js"

type CollectProps = {
    collector: ReactionCollector
    guild: Guild
    roles: string[]
    icons: string[]
}

type RemoveProps = {
    reaction: Reaction
    user: User
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

export async function removeRole({reaction, user}: RemoveProps) {
    // @ts-expect-error
    const content = reaction.message.embeds[0].data.fields[0].value
    const roleRegex = /<@&(\d+)>/g
    const messageRoles = content.match(roleRegex) || []
    const roleIds = messageRoles.map((match: string) => match.slice(3, -1))
    const icons = content.split('\n').map((icon: string) =>
        icon[1] === ':' ? icon.split(':')[1] : icon.substring(0, 2)
    )

    const emoji = reaction._emoji.name
    const reactionEmoji = emoji.length < 4 ? emoji.slice(0, 2).trim() : emoji.trim()

    for (let i = 0; i < icons.length; i++) {
        if (icons[i].trim() === reactionEmoji) {
            try {
                // Fetches the member from the guild
                // @ts-expect-error
                const member = await reaction.message.guild.members.fetch(user.id)

                // Removees the role from the member
                if (member && roleIds[i]) {
                    await member.roles.remove(roleIds[i])
                } else {
                    console.error('Member or role ID not found')
                }
            } catch (error) {
                console.error('Error removing role:', error)
            }

            break
        }
    }
}
