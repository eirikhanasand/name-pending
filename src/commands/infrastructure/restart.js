import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { currentTime } from '../../webarchive/utils.js';
import { exec } from 'child_process';
import config from '../../../config.json' assert { type: "json" };

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts a service')
    .addStringOption((option) =>
        option
            .setName('reason')
            .setDescription('Reason for the restart')
    )
    .addBooleanOption((option) =>
        option
            .setName('force')
            .setDescription('Force restart')
    );
export async function execute(interaction) {
    const argument = interaction.options.getString('argument');
    console.log(argument)
    await bot(interaction)
}

/**
 * Replies to the interaction with a custom status
 * 
 * @param {ChatInputCommandInteraction<CacheType>} interaction Interaction to reply to
 * @param {string} msg Status message
 * @returns {void} Updates the message and returns void when done
 */
async function reply(interaction, process, msg) {
    switch (process) {
        case "error": {
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
        default: console.log(`Unknown process ${process}`); return
    }
}

/**
 * Restarts the bot itself
 * @param {ChatInputCommandInteraction<CacheType>} interaction 
 */
async function bot(interaction) {
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
        reply(interaction, '"error"', `Spawned child ${childPID}`)
    });

    child.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    child.on('close', () => {
        previousChildPID = childPID
        reply(interaction, '"error"', `Killed child ${previousChildPID}`)
    });
}