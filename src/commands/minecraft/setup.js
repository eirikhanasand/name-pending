import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { exec } from 'child_process';
import config from '../../../config.json' assert { type: "json" };


export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Sets up a service in the selected channel.')
    .addStringOption((option) => option
        .setName('service')
        .setDescription('Service to setup')
    )
export async function execute(message) {
    const service = message.options.getString('service');
    const embed = new EmbedBuilder()
    .setTitle("Setting up service")
    .setDescription("Sets up a service of your choice")
    .setColor("#fd8738")
    .setTimestamp()
    .addFields(
        {name: "Status", value: "Starting...", inline: true},
        {name: "Service", value: `${service}`, inline: true}
    )

    await message.reply({ embeds: [embed], ephemeral: true });
    setup(message, service)
}

function setup(message, service) {
    switch (service) {
        case "whitelist":   setupRemote(message);  return
        case "chat":        setupChat(message);    return
        default: reply(message, "Failed, invalid service", service); return
    }
}

function setupRemote(message) {
    const uploadToGit = [
        'cd src',
        'rm -rf minefly',
        `git clone https://${config.docker_username}:${config.minecraft}@git.logntnu.no/tekkom/ludens/minefly.git`,
    ];

    // Runs the commands listen in the array on the system
    const child = exec(uploadToGit.join(' && '));
    reply(message, `Spawned child ${child.pid}`, "whitelist")

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(data);
        reply(message, `${data.slice(0, 1024)}`, "whitelist")
    });

    child.stderr.on('data', (data) => {
        console.error(data);
        reply(message, `${data.slice(0, 1024)}`, "whitelist")
    });
 
    child.on('close', () => {
        reply(message, `Killed child ${child.pid}`, "whitelist")
        reply(message, 'Success', "whitelist")
    });
}

/**
 * Replies to the message with a custom status
 * 
 * @param {ChatInputCommandInteraction<CacheType>} message message to reply to
 * @param {string} status Status message
 * @param {string} reason Reason for reply
 * @returns {void} Updates the message and returns void when done
 */
async function reply(message, status, service) {
    
    const embed = new EmbedBuilder()
        .setTitle("Whitelist")
        .setDescription("Whitelisting users")
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: status, inline: true},
            {name: "Service", value: service, inline: true}
        )

    await message.editReply({ embeds: [embed] });
}

function setupChat(message) {
    const uploadToGit = [
        'cd ../..',
        'rm -rf minefly',
        `git clone https://${config.docker_username}:${config.docker_password}@git.logntnu.no/tekkom/ludens/minefly.git`,
    ];

     // Runs the commands listen in the array on the system
     const child = exec(uploadToGit.join(' && '));
     reply(message, `Spawned child ${child.pid}`)
 
     // Pipes the output of the child process to the main application console
     child.stdout.on('data', (data) => {
         console.log(data);
         reply(message, `${data.slice(0, 1024)}`)
     });
 
     child.stderr.on('data', (data) => {
         console.error(data);
         reply(message, "error", `${data.slice(0, 1024)}`)
     });
 
     child.on('close', () => {
         reply(message, `Killed child ${child.pid}`, "whitelist")
         reply(message, 'Success', "whitelist")
     });
}