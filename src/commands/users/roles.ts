import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, User, ReactionEmoji, Guild, Role } from 'discord.js'
import storedEmbeds from "../../managed/roles.js"
import config from '../../../config.js'
import { exec } from 'child_process'
import { Reaction, Roles } from '../../../interfaces.js'

export const data = new SlashCommandBuilder()
    .setName('roles')
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

export async function execute(message: ChatInputCommandInteraction) {
    // Checking if the author is allowed to setup services
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply("Unauthorized.")
    }

    const title = message.options.getString('title')

    if (!title) {
        return await message.reply('Missing title')
    }

    const name = message.options.getString('description')
    
    if (!name) {
        return await message.reply('Missing description')
    }

    const roleString = message.options.getString('roles')

    if (!roleString) {
        return await message.reply('Missing roles')
    }

    const roleIconsString = message.options.getString('icons')

    if (!roleIconsString) {
        return await message.reply('Missing icons')
    }

    const roles = Array.from(roleString.trim().split(' '))
    const roleIcons = Array.from(roleIconsString.trim().split(' '))

    roleIcons.forEach((icon) => {
        const emoji = message.guild?.emojis.cache.find(emoji => emoji.name === icon)
        const options: any = message.options
        const params = options._hoistedOptions.map((param: NameValueObject) => `${param.name}:${param.value}`)
        const input = `/roles ${params.join(' ')}`

        if (!(isValidEmoji(icon) || emoji)) {
            return message.reply({
                content: `There is no emoji named \`\`${icon}\`\`\ \nYou entered: \`\`\`text\n${input}\`\`\``, 
                ephemeral: true
            })
        }
    })

    const value = roles.map((role, index) => `${roleIcons[index] ? roleIcons[index] : '❓'} <@&${role}>`).join('\n')
    const guild = message.guild

    if (!guild) {
        return await message.reply('Guild unavailable.')
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor("#fd8738")
        .setTimestamp()
        .addFields({name, value})

    const response = await message.reply({ embeds: [embed], fetchReply: true })

    storedEmbeds.push({"channelID": message.channelId, "message": response.id})
    const save = ['cd src/managed', `echo 'const roles = ${JSON.stringify(storedEmbeds)}\nexport default roles' > roles.js`]
    const child = exec(save.join(' && '))

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
            const emoji = reaction._emoji.name

            if (match && match[1] === reaction._emoji.name) {
                member.roles.remove(roles[i])
                break
            } else if (roleIcons[i] === reaction._emoji.name) {
                member.roles.remove(roles[i])
                break
            }
        }
    })
}

function isValidEmoji(emoji: string) {
    const validEmojiRegex = /^([\uD800-\uDBFF][\uDC00-\uDFFF])|[\u2600-\u27FF\u2B50\u2934\u2935\u2B06\u2194\u2195\u25AA\u25AB\u25FE\u25FD\u25FC\u25B6\u25C0\u23E9\u23EA\u23F8\u23F9\u23FA\u25B6\u25C0]$/
    return validEmojiRegex.test(emoji)
}
