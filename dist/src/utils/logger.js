import config from "../../config.json" assert { type: "json" };
/**
 * Logs the status of a whitelist message to the log channel
 * @param {*} message Message object from Discord
 * @param {*} user Author of the message
 * @param {*} status Status of the request
 */
export default function log(message, content) {
    const guild = message.guild;
    const logChannel = guild.channels.cache.get(config.minecraft_log);
    if (logChannel) {
        // Sends a message to the target channel
        logChannel.send(`${message.member.nickname} (ID: ${message.user.id}, Username: ${message.user.username}): ${content}`);
    }
    else {
        // Logs it in the terminal if no channel is set
        console.log(`${message.member.nickname} (ID: ${message.user.id}, Username: ${message.user.username}): ${content}`);
    }
}
