import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { exec } from 'child_process';
import config from '../../../config.json' assert { type: "json" };

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the specified service')
    .addStringOption((option) =>
        option
            .setName('service')
            .setDescription('Service to restart')
    )
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Reason for the restart')
    )
    .addStringOption((option) =>
        option
            .setName('branch')
            .setDescription('Branch to launch from')
    )
export async function execute(interaction) {
    const service = interaction.options.getString('service');
    const reason = interaction.options.getString('reason');
    const branch = interaction.options.getString('branch');
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('**Restarts the specified service.**\n\n**Valid services:**\nnotification\nself')
        .setColor("#fd8738")
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .setTimestamp()
        .addFields({name: "Loading...", value: "...", inline: true})

    if (!interaction.replied) {
        await interaction.reply({ embeds: [embed]});
    } else {
        await interaction.editReply({ embeds: [embed]});
    }

    if (!serviceExists(service) || !reason) {
        await replyInvalid(interaction, service, reason)
        return
    }


    switch (service) {
        case "self": {
            await restartBot(interaction, reason, branch);
            return;
        }
        case "beehive": {
            await restartBeehive(interaction, reason, branch);
            return;
        }
        case "notification": {
            await restartNotification(interaction, reason, branch);
            return;
        }
        default: {
            await replyInvalid(interaction, service, reason, branch)
            return;
        }
    }
}

/**
 * Replies to the interaction with a custom status
 * 
 * @param {ChatInputCommandInteraction<CacheType>} interaction Interaction to reply to
 * @param {string} status Status message
 * @param {string} reason Reason for reply
 * @returns {void} Updates the message and returns void when done
 */
async function reply(interaction, service, status, reason) {
    
    function description() {
        switch (service) {
            case "error": return {title: 'Restart', description: 'Restarting the bot. The message will be updated when the bot is restarted.'}
            case "notification": return {title: 'Restart', description: 'Restarting the notification microservice.'}
            case "beehive": return {title: 'Restart', description: 'Restarting beehive.'}
        }
    }

    const content = description()

    const embed = new EmbedBuilder()
            .setTitle(content.title)
            .setDescription(content.description)
            .setColor("#fd8738")
            .setTimestamp()
            .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
            .addFields(
                {name: "Status", value: status, inline: true},
                {name: "Reason", value: reason, inline: true},
                {name: "Branch", value: branch, inline: true},
            )

            await interaction.editReply({ embeds: [embed] });
}

/**
 * Restarts the bot itself
 * @param {ChatInputCommandInteraction<CacheType>} interaction 
 */
async function restartBot(interaction, reason, branch) {
    let childPID, previousChildPID
    // const restart = [ // TODO MAKE Docker Outside Of Docker PROCESS
    //     'rm -rf tekkom-bot',
    //     'git clone https://git.logntnu.no/tekkom/playground/tekkom-bot.git',
    //     'cd tekkom-bot',
    //     'npm i',
    //     'touch config.json',
    //     `echo '{"token": "${config.token}", "clientId": "${config.clientId}", "guildId": "${config.guildId}"}' > config.json`,
    //     `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
    //     'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest .',
    //     'docker image pull registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest',
    //     'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest tekkom-bot',
    //     'cd ..',
    //     'rm -rf tekkom-bot',
    // ];

    const restart = [
        'cd ..',
        `echo '#!/bin/bash\nrm -rf tekkom-bot\ngit clone ${branch ? `-b ${branch} ` : ""}https://git.logntnu.no/tekkom/playground/tekkom-bot.git\ncd tekkom-bot\nnpm i && npm start'> temp.sh`,
        `echo '{"token": "${config.token}", "clientId": "${config.clientId}", "guildId": "${config.guildId}", "docker_username": ${config.docker_username}, "docker_password": "${config.docker_password}"}' > config.json`,
        `echo '{"branch": "${branch}", "reason": "${reason}", "interaction": "${interaction}"}' > info.json`,
        'chmod +x temp.sh',
        './temp.sh'
    ];

    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarting the bot. The message will be updated when the bot is restarted.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .addFields(
            {name: "Status", value: "Starting...", inline: true},
            {name: "Reason", value: reason, inline: true}
        )
    await interaction.editReply({ embeds: [embed]});

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));
    childPID = child.pid
    reply(interaction, "error", `Spawned child ${childPID}`, reason)

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(data);
        reply(interaction, "error", `${data.slice(0, 1024)}`, reason)
    });

    child.stderr.on('data', (data) => {
        console.error(data);
        reply(interaction, "error", `${data.slice(0, 1024)}`, reason)
    });

    child.on('close', () => {
        previousChildPID = childPID
        reply(interaction, "error", `Killed child ${previousChildPID}`, reason)
    });
}

/**
 * Restarts the notification service
 * @param {ChatInputCommandInteraction<CacheType>} interaction 
 */
async function restartNotification(interaction, reason, branch) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarting the notification microservice.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .addFields(
            {name: "Status", value: "Starting...", inline: true},
            {name: "Reason", value: reason, inline: true},
        )
    await interaction.editReply({ embeds: [embed]});

    const restart = [
        'rm -rf automatednotifications',
        `git clone ${branch ? `-b ${branch}`: ""} https://git.logntnu.no/tekkom/apps/automatednotifications.git`,
        'cd automatednotifications',
        'npm i',
        'touch .secrets.ts',
        `echo 'export const api_key = "${config.notification_api_key}"\nexport const api_url = "${config.notification_api_url}"' > .secrets.ts`,
        `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
        'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/apps/automatednotifications:latest .',
        'docker image pull registry.git.logntnu.no/tekkom/apps/automatednotifications:latest',
        'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/apps/automatednotifications:latest nucleus-notifications',
        'cd ..',
        'rm -rf automatednotifications',
    ];

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));
    reply(interaction, "notification", `Spawned child ${child.pid}`, reason)
    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(data);
        reply(interaction, "notification", `${data.slice(0, 1024)}`, reason)
    });

    child.stderr.on('data', (data) => {
        console.error(data);
        reply(interaction, "notification", `${data.slice(0, 1024)}`, reason)
    });

    child.on('close', () => {
        reply(interaction, "notification", `Killed child ${child.pid}`, reason)
        reply(interaction, "notification", `Success`, reason)
    });
}

/**
 * Restarts beehive
 * @param {ChatInputCommandInteraction<CacheType>} interaction 
 */
async function restartBeehive(interaction, reason, branch) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarts beehive.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .addFields(
            {name: "Status", value: "Starting...", inline: true},
            {name: "Reason", value: reason, inline: true},
        )
    await interaction.editReply({ embeds: [embed]});

    const restart = [
        'rm -rf frontend',
        `git clone ${branch ? `-b ${branch}`: ""} https://${config.docker_username}:${config.docker_password}@git.logntnu.no/tekkom/web/beehive/frontend.git`,
        'cd frontend',
        'npm i',
        `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
        'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/web/beehive/frontend:latest .',
        'docker image pull registry.git.logntnu.no/tekkom/web/beehive/frontend:latest',
        'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/web/beehive/frontend:latest beehive',
        'cd ..',
        'rm -rf frontend',
    ];

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(data);
        reply(interaction, "beehive", `Spawned child ${child.pid}`, reason)
    });

    child.stderr.on('data', (data) => {
        console.error(data);
        reply(interaction, "beehive", `${data.slice(0, 1024)}`, reason)
    });

    child.on('close', () => {
        reply(interaction, "beehive", `Killed child ${child.pid}`, reason)
        reply(interaction, "beehive", `Success`, reason)
    });
}

async function replyInvalid(interaction, service, reason, branch) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('**Restarts the specified service.**\n\n**Valid services:**\nnotification\nself')
        .setColor("#fd8738")
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .setTimestamp()
        .addFields(
            {name: serviceExists(service) ? "Service" : "Invalid service", value: service ? service : "undefined", inline: true},
            {name: reason ? "Reason" : "Invalid reason", value: reason ? reason : "undefined", inline: true},
            {name: branch ? "Reason" : " ", value: branch ? branch : " ", inline: true}
        )
    await interaction.editReply({ embeds: [embed]});
}

function serviceExists(service) {
    const services = ["self", "notification", "beehive"]

    return services.includes(service)
}
