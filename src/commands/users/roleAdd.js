import { SlashCommandBuilder, EmbedBuilder } from 'discord.js'
import roleListeners from "../../managed/roleListeners.js"
import { exec } from 'child_process'

export const data = new SlashCommandBuilder()
    .setName('rolelistener')
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

export async function execute(message) {
    const title = message.options.getString('title')
    const name = message.options.getString('description')
    const roleString = message.options.getString('roles')
    const roleIconsString = message.options.getString('icons')
    const roles = Array.from(roleString.trim().split(' '))
    const roleIcons = Array.from(roleIconsString.trim().split(' '))
    const value = roles.map((role, index) => `${roleIcons[index] ? roleIcons[index] : '❓'} <@&${role}>`).join('\n')
    const guild = message.guild
    roleListeners.push({"channelID": message.channelId, "message": message.id})
    const save = ['cd src/managed', `echo 'const roles = ${JSON.stringify(roleListeners)}\nexport default roles' > roleListeners.js`]
    const child = exec(save.join(' && '))

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor("#fd8738")
        .setTimestamp()
        .addFields({name, value})

    const response = await message.reply({ embeds: [embed], fetchReply: true, ephemeral: true })

    // Stores the message locally in case of a bot restart

    child.stdout.on('data', (data) => {
        console.log(data)
    })

    child.stderr.on('data', (data) => {
        console.log(data)
    })

    child.on('close', () => {
        console.log("closed")
    })

    for (let i = 0; i < roleIcons.length; i++) {
        response.react(roleIcons[i])
    }

    const responseCollector = response.createReactionCollector({
        filter: (reaction, user) => !user.bot, 
        dispose: true
    })

    responseCollector.on('collect', async(reaction, user) => {
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

    responseCollector.on('remove', async(reaction, user) => {
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
}
