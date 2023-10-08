import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { currentTime } from '../../webarchive/utils.js';
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
export async function execute(interaction) {
    const service = interaction.options.getString('service');
    const reason = interaction.options.getString('reason');
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('**Restarts the specified service.**\n\n**Valid services:**\nnotification\nself')
        .setColor("#fd8738")
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .setTimestamp()
        .addFields(
            {name: "Loading...", value: "...", inline: true},
        )
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
            console.log("self")
            await restartBot(interaction, reason);
            return;
        }
        case "beehive": {
            console.log("beehive")
            await restartBeehive(interaction, reason);
            return;
        }
        case "notification": {
            console.log("notification")
            await restartNotification(interaction, reason);
            return;
        }
        default: {
            console.log("default")
            await replyInvalid(interaction, service, reason)
            return;
        }
    }
}

/**
 * Replies to the interaction with a custom status
 * 
 * @param {ChatInputCommandInteraction<CacheType>} interaction Interaction to reply to
 * @param {string} msg Status message
 * @returns {void} Updates the message and returns void when done
 */
async function reply(interaction, service, status, reason) {
    switch (service) {
        case "error": {
            const embed = new EmbedBuilder()
            .setTitle('Restart')
            .setDescription('Restarting the bot. The message will be updated when the bot is restarted.')
            .setColor("#fd8738")
            .setTimestamp()
            .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
            .addFields(
                {name: "Restarted", value: currentTime(), inline: true},
                {name: "Status", value: status, inline: true},
                {name: "Reason", value: reason, inline: true}
            )

            await interaction.editReply({ embeds: [embed] });
            break;
        }
        case "notification": {
            const embed = new EmbedBuilder()
            .setTitle('Restart')
            .setDescription('Restarting the notification microservice.')
            .setColor("#fd8738")
            .setTimestamp()
            .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
            .addFields(
                {name: "Restarted", value: currentTime(), inline: true},
                {name: "Status", value: msg, inline: true}
            )

            await interaction.editReply({ embeds: [embed] });
            break;
        }
        default: console.log(`Unknown service ${service}`); return
    }
}

/**
 * Restarts the bot itself
 * @param {ChatInputCommandInteraction<CacheType>} interaction 
 */
async function restartBot(interaction, reason) {
    let childPID, previousChildPID
    const restart = [
        'rm -rf tekkom-bot',
        'npm install -g git',
        'git clone git@git.logntnu.no:tekkom/playground/tekkom-bot.git',
        'cd tekkom-bot',
        'npm i',
        'touch config.json',
        `echo '{"token": "${config.token}", "clientId": "${config.clientId}", "guildId": "${config.guildId}"}' > config.json`,
        `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
        'rm -rf automatednotifications',
        'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest .',
        'docker image pull registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest',
        'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest tekkom-bot'
    ];

    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarting the bot. The message will be updated when the bot is restarted.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .addFields(
            {name: "Status", value: "Working...", inline: true},
            {name: "Reason", value: reason, inline: true}
        )
    await interaction.editReply({ embeds: [embed]});

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        childPID = child.pid
        reply(interaction, "error", `Spawned child ${childPID}`, reason)
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reply(interaction, "error", `Error ${data}`, reason)
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
async function restartNotification(interaction, reason) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarting the notification microservice.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .addFields(
            {name: "Status", value: "Working...", inline: true},
            {name: "Reason", value: reason, inline: true},
        )
    await interaction.editReply({ embeds: [embed]});

    const restart = [
        'rm -rf automatednotifications',
        'echo inside automa',
        'npm install -g git',
        'git clone git@git.logntnu.no:tekkom/apps/automatednotifications.git',
        'cd automatednotifications',
        'npm i',
        'touch .secrets.ts',
        `echo 'export const api_key = "${config.notification_api_key}"\nexport const api_url = "${config.notification_api_url}"' > .secrets.ts`,
        'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/apps/automatednotifications:latest .',
        'rm -rf automatednotifications',
        'docker image pull registry.git.logntnu.no/tekkom/apps/automatednotifications:latest',
        `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
        'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/apps/automatednotifications:latest nucleus-notifications'
    ];

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        reply(interaction, "notification", `Spawned child ${child.pid}`, reason)
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reply(interaction, "notification", `Error ${data}`, reason)
    });

    child.on('close', () => {
        reply(interaction, "notification", `Killed child ${child.pid}`, reason)
        reply(interaction, "notification", `Finished`, reason)
    });
}

/**
 * Restarts beehive
 * @param {ChatInputCommandInteraction<CacheType>} interaction 
 */
async function restartBeehive(interaction, reason) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarts beehive.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .addFields(
            {name: "Status", value: "Working...", inline: true},
            {name: "Reason", value: reason, inline: true},
        )
    await interaction.editReply({ embeds: [embed]});

    const restart = [
        'rm -rf frontend',
        'npm install -g git',
        'git clone git@git.logntnu.no:tekkom/web/beehive/frontend.git',
        'cd frontend',
        'npm i',
        'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/web/beehive/frontend:latest .',
        'rm -rf frontend',
        'docker image pull registry.git.logntnu.no/tekkom/web/beehive/frontend:latest',
        `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
        'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/web/beehive/frontend:latest beehive'
    ];

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        reply(interaction, "beehive", `Spawned child ${child.pid}`, reason)
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        reply(interaction, "beehive", `Error ${data}`, reason)
    });

    child.on('close', () => {
        reply(interaction, "beehive", `Killed child ${child.pid}`, reason)
        reply(interaction, "beehive", `Finished`, reason)
    });
}

async function replyInvalid(interaction, service, reason) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('**Restarts the specified service.**\n\n**Valid services:**\nnotification\nself')
        .setColor("#fd8738")
        .setAuthor({name: `Author: ${interaction.user.username} · ${interaction.user.id}`})
        .setTimestamp()
        .addFields(
            {name: serviceExists(service) ? "Service" : "Invalid service", value: service ? service : "undefined", inline: true},
            {name: reason ? "Reason" : "Invalid reason", value: reason ? reason : "undefined", inline: true}
        )
    await interaction.editReply({ embeds: [embed]});
}

function serviceExists(service) {
    const services = ["self", "notification", "beehive"]

    return services.includes(service)
}
