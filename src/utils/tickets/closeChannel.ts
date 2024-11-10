import { ButtonInteraction, CategoryChannel, CategoryChildChannel, Guild, TextChannel } from "discord.js"
import { MAX_CHANNELS } from "../../../constants.js"

type CloseChannelProps = {
    guild: Guild
    interaction?: ButtonInteraction
    currentChannel: TextChannel
}

export default async function closeChannel({ guild, interaction, currentChannel }: CloseChannelProps) {
    // Fetches "archived-tickets" category
    const archive = guild?.channels.cache.find(
        c => c instanceof CategoryChannel && c.name === "archived-tickets"
    ) as CategoryChannel

    if (!archive) {
        if (!interaction) {
            return await currentChannel.send(`This ticket has been closed in Zammad, but cannot be closed in Discord since the "archived-tickets" category cannot be found.`)
        }
        
        return await interaction.reply({
            content: `Could not find "archived-tickets" category.`,
            ephemeral: true,
        })
    }

    // Defers because it usually takes a few seconds to process everything
    if (interaction) {
        await interaction.deferReply({ ephemeral: true })
    }

    const children = archive.children.cache            

    // Checks and handles max closed channels
    if (children.size >= MAX_CHANNELS) {
        const sortedChannels: { channel: CategoryChildChannel; timestamp: number }[] = []
    
        for (const [_, channel] of children) {
            try {
                const lastMessageId = channel.lastMessageId || ''
                const lastMessage = await channel.messages.fetch(lastMessageId)
                
                if (lastMessage) {
                    const timestamp = lastMessage.createdTimestamp

                    sortedChannels.push({
                        channel,
                        timestamp,
                    })
                }
            } catch (error) {
                // Assumes no activity if no messages can be found
                sortedChannels.push({
                    channel,
                    timestamp: 0,
                })
            }
        }

        sortedChannels.sort((a, b) => a.timestamp - b.timestamp)
    
        // Deletes 10 oldest channels (20%, to avoid fetching all channels every time someone closes a ticket)
        for (let i = 0; i < 10; i++) {
            const channelToDelete = sortedChannels[i]?.channel;
            if (channelToDelete) {
                await channelToDelete.delete('Archiving a new ticket, deleted the oldest one.')
                console.log(`Deleted channel: ${channelToDelete.name}`)
            }
        }
    }

    // Moves the channel to the "archived-tickets" category
    await currentChannel.setParent(archive.id, { lockPermissions: false })

    // Removes all roles from the channel except the bot's role.
    const bot = currentChannel.guild.members.me
    const roles = currentChannel.guild.roles.cache
    
    roles.forEach(async (role) => {
        if (bot?.roles.cache.has(role.id)) return
        
        const permissionOverwrites = currentChannel.permissionOverwrites.cache.get(role.id)
        if (permissionOverwrites) {
            // Removes overwrites if they exist
            await currentChannel.permissionOverwrites.delete(role.id)
        }
    })

    // Removes all members from the channel
    const members = currentChannel.guild.members.cache
    members.forEach(async (member) => {
        // Skip removing if it's the bot
        if (member.id === bot?.id) return
        
        const permissionOverwrites = currentChannel.permissionOverwrites.cache.get(member.id)
        if (permissionOverwrites) {
            // Removes overwrites if they exist
            await currentChannel.permissionOverwrites.delete(member.id)
        }
    })

    return true
}
