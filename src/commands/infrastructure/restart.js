import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { currentTime } from '../../webarchive/utils.js';
import { exec } from 'child_process';
import config from '../../../config.json' assert { type: "json" };

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot');
export async function execute(interaction) {
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
    const childProcess = exec(`rm -rf tekkom-bot && git clone git@git.logntnu.no:tekkom/playground/tekkom-bot.git && cd tekkom-bot && npm i && touch config.json && echo ${config} > config.json && npm run start`);

    // Pipes the output of the child process to the main application console
    childProcess.stdout.on('data', (data) => {
        console.log("Status 1")
        console.log(`stdout: ${data}`);
        reply(interaction, "Finished")
    });

    childProcess.stderr.on('data', (data) => {
        console.log("Status 2")
        console.error(`stderr: ${data}`);
    });

    childProcess.on('close', (code) => {
        console.log("Status 3")
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
            console.log("Status 4")
            reply(interaction, "Failed: Terminated")
        } else {
            console.log("Status 5")
            reply(interaction, `Failed: Error ${code}`)
        }
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