import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { currentTime } from '../../webarchive/utils.js';
import { exec } from 'child_process';
import config from '../../../config.json' assert { type: "json" };

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot');
export async function execute(interaction) {
    let childPID, previousChildPID
    const restart = [
        'rm -rf tekkom-bot',
        'git clone git@git.logntnu.no:tekkom/playground/tekkom-bot.git',
        'cd tekkom-bot',
        'npm i',
        'touch config.json',
        `echo '{"token": "${config.token}", "clientId": "${config.clientId}", "guildId": "${config.guildId}"}' > config.json`,
        'npm run start',
    ];

    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarting the bot. The message will be updated when the bot is restarted.')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Restarted", value: currentTime(), inline: true},
            {name: "Status", value: "Working...", inline: true}
        )
    await interaction.reply({ embeds: [embed]});

    // Run a command on your system using the exec function
    const child = exec(restart.join(' && '));

    // Pipes the output of the child process to the main application console
    child.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        childPID = child.pid
        reply(interaction, `Spawned child ${childPID}`)
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', () => {
        previousChildPID = childPID
        reply(interaction, `Killed child ${previousChildPID}`)
    });
}

/**
 * Replies to the interaction with a custom status
 * 
 * @param {unknown} interaction Interaction to reply to
 * @param {string} msg Status message
 * @returns {void} Updates the message and returns void when done
 */
async function reply(interaction, msg) {
    const embed = new EmbedBuilder()
        .setTitle('Restart')
        .setDescription('Restarting the bot. The message will be updated when the bot is restarted.')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            {name: "Restarted", value: currentTime(), inline: true},
            {name: "Status", value: msg, inline: true}
        )

    await interaction.editReply({ embeds: [embed] });
}