import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { exec } from 'child_process';
import config from '../../../config.json' assert { type: "json" };

export const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Tests that docker is running and has the correct permissions')

export async function execute(message) {
    const embed = new EmbedBuilder()
        .setTitle('Test')
        .setDescription('Tests that docker is running and has the correct permissions.')
        .setColor("#fd8738")
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .setTimestamp()
        .addFields({name: "Loading...", value: "...", inline: true})

    if (!message.replied) {
        await message.reply({ embeds: [embed]});
    } else {
        await message.editReply({ embeds: [embed]});
    }

    await testDocker(message);
}

async function reply(message, status) {
    const embed = new EmbedBuilder()
        .setTitle('Test')
        .setDescription('Tests that docker is running and has the correct permissions')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: status, inline: true},
            {name: "Reason", value: "Test", inline: true}
        )

    await message.editReply({ embeds: [embed] });
}

async function testDocker(message) {
    let childPID, previousChildPID
    const restart = [
        'rm -rf tekkom-bot',
        'git clone https://git.logntnu.no/tekkom/playground/tekkom-bot.git',
        'cd tekkom-bot',
        'npm i',
        'touch config.json',
        `echo '{"token": "${config.token}", "clientId": "${config.clientId}", "guildId": "${config.guildId}"}' > config.json`,
        `docker login --username ${config.docker_username} --password ${config.docker_password} registry.git.logntnu.no`,
        'docker buildx build --platform linux/amd64,linux/arm64 --push -t registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest .',
        'docker image pull registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest',
        'docker service update --with-registry-auth --image registry.git.logntnu.no/tekkom/playground/tekkom-bot:latest tekkom-bot',
        'cd ..',
        'rm -rf tekkom-bot',
        'echo Finished restarting bot'
    ];

    const embed = new EmbedBuilder()
        .setTitle('Test')
        .setDescription('Tests that docker is running and has the correct permissions.')
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: "Starting...", inline: true},
            {name: "Reason", value: "Test", inline: true}
        )
    await message.editReply({ embeds: [embed]});

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(data);
        childPID = child.pid
        reply(message, `Spawned child ${childPID}`)
    });

    child.stderr.on('data', (data) => {
        console.error(data);
        reply(message, `${data}`)
    });

    child.on('close', () => {
        previousChildPID = childPID
        reply(message, `Killed child ${previousChildPID}`)
        reply(message, `Success`)
    });
}
