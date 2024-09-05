import { SlashCommandBuilder } from 'discord.js';
import http from "http";
import config from '../../utils/config.js';
export const data = new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Establishes a connection between Minecraft and this Discord chat');
export async function execute(message) {
    await message.reply({ content: 'Connection established!', ephemeral: true });
    // Filter to check that the author is not a bot to prevent an infinite loop
    const filter = (response) => !response.author.bot;
    // Message collector that collects all messages written in Discord
    if (!message.channel || !message.channel?.isTextBased()) {
        return await message.reply({ content: 'This command can only be used in text channels.', ephemeral: true });
    }
    const textChannel = message.channel;
    const collector = textChannel.createMessageCollector({ filter });
    // Seperate collector that listens to reactions on all messages
    const botMessageCollector = textChannel.createMessageCollector();
    collector?.on('collect', (m) => {
        post(`${m.author.username || m.author.globalName || m.author.id}: ${m.content}`);
    });
    botMessageCollector?.on('collect', (m) => {
        // Listens for reactions for 1 minute on each message
        const reactionCollector = m.createReactionCollector({ time: 60000 });
        // Logs the reaction interaction in game
        reactionCollector.on('collect', (reaction, user) => {
            post(`${user.tag} reacted with ${reaction._emoji.name}`);
        });
    });
    updatePlayerCount(message);
    listen(message);
}
/**
 * Posts the message from Discord on all servers
 * @param {Discord_Message} message
 */
function post(message) {
    config.minecraft_servers.forEach((server) => {
        console.log(`${config.minecraft_url}:${server.port}/${server.name}-message`);
        fetch(`${config.minecraft_url}:${server.port}/${server.name}-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: message
        });
    });
}
/**
 * Listens for content from Minecraft and posts it on Discord
 * @param {Discord_Message} message
 */
async function listen(message) {
    const textChannel = message.channel;
    const server = http.createServer((req) => {
        if (req.headers['type'] === 'death') {
            req.on('data', chunk => {
                textChannel.send(`**${chunk.toString()}**`);
            });
        }
        else {
            req.on('data', chunk => {
                textChannel.send(chunk.toString());
            });
        }
    });
    server.listen(config.minecraft_port);
}
/**
 * Updates the channel description of the channel tracking the Minecraft
 * chats with the player counts.
 * @param {*} message Message object
 */
async function updatePlayerCount(message) {
    const channel = message.channel;
    // Runs once per 5 minutes as long as the chat is being mirrored
    while (true) {
        let survival = [];
        let creative = [];
        const maxWidth = 20;
        let players = "";
        let topic = "";
        await Promise.allSettled(config.minecraft_servers.map(async (server) => {
            const response = await fetch(`${config.minecraft_url}:${server.port}/${server.name}-online`);
            const data = await response.json();
            switch (server.name) {
                case "survival":
                    survival = data;
                    break;
                case "creative":
                    creative = data;
                    break;
            }
        }));
        let playersSurvival = survival.length;
        let playersCreative = creative.length;
        for (let i = 0; i < Math.max(playersSurvival, playersCreative); i++) {
            const playerSurvival = (survival[i] || "").substring(0, maxWidth);
            const playerCreative = (creative[i] || "").substring(0, maxWidth);
            const spacesSurvival = "\t".repeat(Math.max(0, (maxWidth - playerSurvival.length) / 4));
            const spacesCreative = "\t".repeat(Math.max(0, (maxWidth - playerCreative.length) / 4));
            const tabs = Math.max(1, Math.floor((maxWidth - playerSurvival.length) / 4));
            const tabCharacters = "\t".repeat(tabs);
            players += `${playerSurvival}${spacesSurvival}${tabCharacters}${playerCreative}${spacesCreative}\n`;
        }
        const online = survival.length + creative.length;
        if (online) {
            topic = `Logins Minecraft server. Online: ${online}\nSurvival (${survival.length})\t\t\t\t   Creative (${creative.length})\n${players}`;
        }
        else {
            topic = `Logins Minecraft server. There are no players online at this time.`;
        }
        if (channel && 'setTopic' in channel) {
            channel?.setTopic(topic);
        }
        else {
            console.log("Failed to set topic in minecraft/chat.ts");
        }
        // Waits for 5 minutes (Discord rate limit)
        await new Promise(resolve => setTimeout(resolve, 300000));
    }
}
