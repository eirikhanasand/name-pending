import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, CacheType, Role, Collection } from 'discord.js'
import { exec } from 'child_process'
import config from '../../../config.js'
import { Roles } from '../../../interfaces.js'

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the specified service')
    .addStringOption((option) => option
        .setName('service')
        .setDescription('Service to restart')
    )
    .addStringOption((option) => option
        .setName('reason')
        .setDescription('Reason for the restart')
    )
    .addStringOption((option) => option
        .setName('branch')
        .setDescription('Branch to launch from')
    )
export async function execute(message: ChatInputCommandInteraction) {
    const service = message.options.getString('service')
    const reason = message.options.getString('reason')
    const branch = message.options.getString('branch')
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('**Restarts the specified service.**\n\n**Valid services:**\nnotification\nself\nbeehive')
        .setColor("#fd8738")
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .setTimestamp()
        .addFields({name: "Loading...", value: "...", inline: true})

    // Checking if user should be allowed to remove users from the whitelist
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)

    // Aborts if the user does not have sufficient permissions
    if (!isAllowed) {
        return await message.reply("Unauthorized.")
    }
    
    if (!message.replied) {
        await message.reply({ embeds: [embed]})
    } else {
        await message.editReply({ embeds: [embed]})
    }

    if (!serviceExists(service || '') || !reason) {
        await replyInvalid(message, service || '', reason || '', "Default")
        return
    }

    switch (service) {
        case "self": {
            await restartBot(message, reason, branch ? branch : "main")
            return
        }
        case "beehive": {
            await restartBeehive(message, reason, branch ? branch : "master")
            return
        }
        case "notification": {
            await restartNotification(message, reason, branch ? branch : "main")
            return
        }
        default: {
            await replyInvalid(message, service || '', reason, branch ? branch : "Default")
            return
        }
    }
}

/**
 * Replies to the message with a custom status
 * 
 * @param message message to reply to
 * @param status Status message
 * @param reason Reason for reply
 * @returns Updates the message and returns void when done
 */
async function reply(message: ChatInputCommandInteraction<CacheType>, service: string, status: string, reason: string, branch: string) {
    
    function description() {
        switch (service) {
            case "error": return {title: 'Restart', description: 'Restarting the bot. The message will be updated when the bot is restarted.'}
            case "notification": return {title: 'Restart', description: 'Restarting the notification microservice.'}
            case "beehive": return {title: 'Restart', description: 'Restarting beehive.'}
        }

        return { title: 'Unknown', description: 'Unknown'}
    }

    const content = description()

    const embed = new EmbedBuilder()
        .setTitle(content.title)
        .setDescription(content.description)
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: status, inline: true},
            {name: "Reason", value: reason, inline: true},
            {name: "Branch", value: branch, inline: true},
        )

    await message.editReply({ embeds: [embed] })
}

/**
 * Restarts the bot itself
 * @param message 
 */
async function restartBot(message: ChatInputCommandInteraction<CacheType>, reason: string, branch: string) {
    let childPID = '', previousChildPID

    const restart = [
        'cd ..',
        `echo '#!/bin/bash\nrm -rf tekkom-bot\ngit clone -b ${branch} https://git.logntnu.no/tekkom/playground/tekkom-bot.git\ncd tekkom-bot\necho """{\\"token\\": \\"${config.token}\\", \\"clientId\\": \\"${config.clientId}\\", \\"guildId\\": \\"${config.guildId}\\", \\"docker_username\\": \\"${config.docker_username}\\", \\"docker_password\\": \\"${config.docker_password}\\", \\"minecraft_command\\": \\"${config.minecraft_command}\\"}""" > config.json\nnpm i && npm start'> temp.sh`,
        `echo '{"branch": "${branch}", "reason": "${reason}", "channelID": "${message.channelId}", "username": "${message.user.username}", "userID": "${message.user.id}"}' > info.json`,
        'chmod +x temp.sh',
        './temp.sh'
    ]

    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarting the bot. The message will be updated when the bot is restarted.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: "Starting...", inline: true},
            {name: "Reason", value: reason, inline: true}
        )
    await message.editReply({ embeds: [embed]})
    

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '))
    childPID = String(child.pid)
    reply(message, "error", `Spawned child ${childPID}`, reason, branch)

    // Pipes the output of the child process to the main application console
    child.stdout?.on('data', (data) => {
        console.log(data)
        reply(message, "error", `${data.slice(0, 1024)}`, reason, branch)
    })

    child.stderr?.on('data', (data) => {
        console.error(data)
        reply(message, "error", `${data.slice(0, 1024)}`, reason, branch)
    })

    child.on('close', () => {
        previousChildPID = childPID
        reply(message, "error", `Killed child ${previousChildPID}`, reason, branch)
    })
}

/**
 * Restarts the notification service
 * @param {ChatInputCommandInteraction<CacheType>} message 
 */
async function restartNotification(message: ChatInputCommandInteraction<CacheType>, reason: string, branch: string) {
    await message.editReply('Missing API key.')
    // const embed = new EmbedBuilder()
    //     .setTitle('Restart')
    //     .setDescription('Restarting the notification microservice.')
    //     .setColor("#fd8738")
    //     .setTimestamp()
    //     .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
    //     .addFields(
    //         {name: "Status", value: "Starting...", inline: true},
    //         {name: "Reason", value: reason, inline: true},
    //     )
    // await message.editReply({ embeds: [embed]})

    // const restart = [
    //     'rm -rf automatednotifications',
    //     `git clone -b ${branch} https://git.logntnu.no/tekkom/apps/automatednotifications.git`,
    //     'cd automatednotifications',
    //     'npm i',
    //     'touch .secrets.ts',
    //     `echo 'export const api_key = "${config.notification_api_key}"\nexport const api_url = "${config.notification_api_url}"' > .secrets.ts`,
    //     `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
    //     'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/apps/automatednotifications:latest .',
    //     'docker image pull registry.git.logntnu.no/tekkom/apps/automatednotifications:latest',
    //     'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/apps/automatednotifications:latest nucleus-notifications',
    //     'cd ..',
    //     'rm -rf automatednotifications',
    // ]

    // // Run a command on your system using the exec function
    // const child = exec(restart.join(' && '))
    // reply(message, "notification", `Spawned child ${child.pid}`, reason, branch)

    // // Pipes the output of the child process to the main application console
    // child.stdout?.on('data', (data) => {
    //     console.log(data)
    //     reply(message, "notification", `${data.slice(0, 1024)}`, reason, branch)
    // })

    // child.stderr?.on('data', (data) => {
    //     console.error(data)
    //     reply(message, "notification", `${data.slice(0, 1024)}`, reason, branch)
    // })

    // child.on('close', () => {
    //     reply(message, "notification", `Killed child ${child.pid}`, reason, branch)
    //     reply(message, "notification", `Success`, reason, branch)
    // })
}

/**
 * Restarts beehive
 * @param {ChatInputCommandInteraction<CacheType>} message 
 */
async function restartBeehive(message: ChatInputCommandInteraction<CacheType>, reason: string, branch: string) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarts beehive.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: "Starting...", inline: true},
            {name: "Reason", value: reason, inline: true},
            {name: "Branch", value: branch, inline: true},
        )
    await message.editReply({ embeds: [embed]})

    const restart = [
        'rm -rf frontend',
        `git clone -b ${branch} https://${config.docker_username}:${config.docker_password}@git.logntnu.no/tekkom/web/beehive/frontend.git`,
        'cd frontend',
        'npm i',
        `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
        'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/web/beehive/frontend:latest .',
        'docker image pull registry.git.logntnu.no/tekkom/web/beehive/frontend:latest',
        'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/web/beehive/frontend:latest beehive',
        'cd ..',
        'rm -rf frontend',
    ]

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '))
    reply(message, "beehive", `Spawned child ${child.pid}`, reason, branch)

    // Pipes the output of the child process to the main application console
    child.stdout?.on('data', (data) => {
        console.log(data)
        reply(message, "beehive", `${data.slice(0, 1024)}`, reason, branch)
    })

    child.stderr?.on('data', (data) => {
        console.error(data)
        reply(message, "beehive", `${data.slice(0, 1024)}`, reason, branch)
    })

    child.on('close', () => {
        reply(message, "beehive", `Killed child ${child.pid}`, reason, branch)
        reply(message, "beehive", `Success`, reason, branch)
    })
}

async function replyInvalid(message: ChatInputCommandInteraction<CacheType>, service: string, reason: string, branch: string) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('**Restarts the specified service.**\n\n**Valid services:**\nnotification\nself')
        .setColor("#fd8738")
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .setTimestamp()
        .addFields(
            {name: serviceExists(service) ? "Service" : "Invalid service", value: service ? service : "undefined", inline: true},
            {name: reason ? "Reason" : "Invalid reason", value: reason ? reason : "undefined", inline: true},
            {name: "Branch", value: branch, inline: true}
        )
    await message.editReply({ embeds: [embed]})
}

function serviceExists(service: string) {
    const services = ["self", "notification", "beehive"]

    return services.includes(service)
}
