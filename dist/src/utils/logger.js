import config from "../../.secrets.js";
/**
 * Logs the status of a whitelist message to the log channel
 * @param {*} message Message object from Discord
 * @param {*} content Content to log
 */
export default function log(message, content) {
    const guild = message.guild;
    if (!guild) {
        return console.log('Message does not contain a valid guild.');
    }
    if (!message.member) {
        return console.log('Invalid user, user has likely been deleted or modified in an unrecognizable way.');
    }
    const logChannel = guild.channels.cache.get(config.minecraft_log);
    const nickname = 'nickname' in message.member ? message.member.nickname : '';
    if (logChannel) {
        // Sends a message to the target channel
        logChannel.send(`${nickname} (ID: ${message.user.id}, Username: ${message.user.username}): ${content}`);
    }
    else {
        // Logs it in the terminal if no channel is set
        console.log(`${nickname} (ID: ${message.user.id}, Username: ${message.user.username}): ${content}`);
    }
}
