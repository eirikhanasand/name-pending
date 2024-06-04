import storedEmbeds from "../../managed/roles.js"
import config from '../../utils/config.js'
import { Roles } from '../../../interfaces.js'
import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ChatInputCommandInteraction, 
    User, 
    Role, 
    Reaction 
} from 'discord.js'

export const data = new SlashCommandBuilder()
    .setName('updaterolemessage')
    .setDescription('Handles roles')
    .addStringOption((option) => option
        .setName('title')
        .setDescription('Header')
    )
    .addStringOption((option) => option
        .setName('description')
        .setDescription('Subheader')
    )
    .addStringOption((option) => option
        .setName('roles')
        .setDescription('IDs of the role(s) to add seperated by space')
    )
    .addStringOption((option) => option
        .setName('icons')
        .setDescription('Icons to display to the left of each role')
    )
    .addStringOption((option) => option
        .setName('id')
        .setDescription('ID of the message to update')
    )

export async function execute(message: ChatInputCommandInteraction) {
    // Checking if the author is allowed to setup services
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply("Unauthorized.")
    }

    const title = message.options.getString('title')

    if (!title) {
        return await message.reply({
            content: `Missing title`, 
            ephemeral: true
        })
    }

    const name = message.options.getString('description')
    
    if (!name) {
        return await message.reply({
            content: `Missing description`, 
            ephemeral: true
        })
    }

    const roleString = message.options.getString('roles')

    if (!roleString) {
        return await message.reply({
            content: `Missing roles`, 
            ephemeral: true
        })
    }

    const roleIconsString = message.options.getString('icons')

    if (!roleIconsString) {
        return await message.reply({
            content: `Missing icons`, 
            ephemeral: true
        })
    }

    const messageID = message.options.getString('id')

    if (!messageID) {
        return await message.reply({
            content: `Missing ID`, 
            ephemeral: true
        })
    }

    await message.reply({
        content: `Working...`, 
        ephemeral: true
    })

    const roles = Array.from(roleString.trim().split(' '))
    const roleIcons = Array.from(roleIconsString.trim().split(' '))

    roleIcons.forEach((icon) => {
        let name = ''
        const match = icon.match(/<:(.*):[0-9]+>/)

        if (match) {
            name = match[1]
        }

        const options: any = message.options
        const params = options._hoistedOptions.map((param: NameValueObject) => `${param.name}:${param.value}`)
        const input = `/roles ${params.join(' ')}`

        if (!isValidEmoji(icon) && !name.length) {
            return message.editReply(`There is no emoji named \`\`${name || icon}\`\`\ \nYou entered: \`\`\`text\n${input}\`\`\``)
        }
    })

    const value = roles.map((role, index) => `${roleIcons[index] ? roleIcons[index] : '❓'} ${role}`).join('\n')
    const guild = message.guild

    if (!guild) {
        return await message.editReply('Guild unavailable.')
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor("#fd8738")
        .setTimestamp()
        .addFields({name, value})

    // Fetches message
    const roleMessage = await message.channel?.messages.fetch(messageID);
    if (!roleMessage) {
        return await message.editReply(`Message with ID ${messageID} not found.`)
    }

    const response = await roleMessage.edit({ embeds: [embed]})

    storedEmbeds.push({"channelID": message.channelId, "message": response.id})

    for (let i = 0; i < roleIcons.length; i++) {
        response.react(roleIcons[i])
    }

    const responseCollector = response.createReactionCollector({
        filter: (reaction, user) => !user.bot, 
        dispose: true
    })

    responseCollector.on('collect', async(reaction: Reaction, user) => {
        const member = await guild.members.fetch(user.id)

        for (let i = 0; i < roleIcons.length; i++) {
            const pattern = /<:(\w+):/
            const match = pattern.exec(roleIcons[i])

            if (match && match[1] === reaction._emoji.name) {
                member.roles.add(roles[i])
                break
            } else if (roleIcons[i] === reaction._emoji.name) {
                member.roles.add(roles[i])
                break
            }
        }
    })

    responseCollector.on('remove', async(reaction: Reaction, user: User) => {
        const member = await guild.members.fetch(user.id)

        for (let i = 0; i < roleIcons.length; i++) {
            const pattern = /<:(\w+):/
            const match = pattern.exec(roleIcons[i])

            if (match && match[1] === reaction._emoji.name) {
                member.roles.remove(roles[i])
                break
            } else if (roleIcons[i] === reaction._emoji.name) {
                member.roles.remove(roles[i])
                break
            }
        }
    })

    await message.editReply(`Message updated`)
}

function isValidEmoji(emoji: string) {
    const validEmojiRegex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])|[\u2600-\u27FF\u2B50\u2934\u2935\u2B06\u2194\u2195\u25AA\u25AB\u25FE\u25FD\u25FC\u25B6\u25C0\u23E9\u23EA\u23F8\u23F9\u23FA\u25B6\u25C0⛏️]$/
    return validEmojiRegex.test(emoji);
}
