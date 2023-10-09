import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import whitelist from "../../minefly/whitelist.json" assert {type: "json"}
import { exec } from 'child_process';

export const data = new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('Whitelists a user on the Minecraft server!')
    .addStringOption((option) => option
        .setName('user')
        .setDescription('User to whitelist')
    )
export async function execute(message) {
    /**
     * Fetching user, slicing to prevent overflow. Discord has a limit of 2k
     * characters or longer for Nitro members, while embeds only allow 1024 
     * characters. Slicing at 30 because longer nicknames are unrealistic
     */
    const user = message.options.getString('user').slice(0, 30);
    const embed = new EmbedBuilder()
        .setTitle("Whitelist")
        .setDescription("Whitelisting users")
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: "Starting...", inline: true},
            {name: "User", value: `${user}`, inline: true}
        )

    await message.reply({ embeds: [embed] });
    // Sanitizes user before adding them to protect against xml attacks
    uploadUser(message, user.replace(/[^a-zA-Z0-9\s]/g, ''))
}

function uploadUser(message, user) {
    const updatedWhitelist = whitelist.users
    updatedWhitelist.push(user)
    
    const uploadToGit = [
        'cd src/minefly',
        `echo '{"users": ${JSON.stringify(updatedWhitelist)}}' > whitelist.json`,
        'git add .',
        `git commit -m "Added user ${user}"`,
        'git push'
    ];

     // Runs the commands listed in the array on the system
     const child = exec(uploadToGit.join(' && '));
     reply(message, `Spawned child ${child.pid}`)
 
     // Pipes the output of the child process to the main application console
     child.stdout.on('data', (data) => {
        console.log(data);
        reply(message, `${data.slice(0, 1024)}`)
     })
 
     child.stderr.on('data', (data) => {
        console.error(data);
        reply(message, `${data.slice(0, 1024)}`)
     })
 
     child.on('close', () => {
        reply(message, `Killed child ${child.pid}`)
        reply(message, 'Success')
     })
}

/**
 * Replies to the message with a custom status
 * 
 * @param {ChatInputCommandInteraction<CacheType>} message message to reply to
 * @param {string} status Status message
 * @param {string} reason Reason for reply
 * @returns {void} Updates the message and returns void when done
 */
async function reply(message, status) {

    const embed = new EmbedBuilder()
        .setTitle("Whitelist")
        .setDescription("Whitelisting users")
        .setColor("#fd8738")
        .setTimestamp()
        .setAuthor({name: `Author: ${message.user.username} · ${message.user.id}`})
        .addFields(
            {name: "Status", value: status, inline: true},
            {name: `${whitelist.users.length > 1 ? "Users" : "User"}`, value: `${whitelist.users}`, inline: true}
        )

    await message.editReply({ embeds: [embed] });
}