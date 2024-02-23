import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import config from '../config.js';
import roles from './managed/roles.js';
const token = config.token;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration
    ] });
client.commands = new Collection();
const foldersPath = join(__dirname, 'commands');
const commandFolders = readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = join(foldersPath, folder);
    const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = join(commandsPath, file);
        const command = await import(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
client.once(Events.ClientReady, async () => {
    // Restarts role listeners after restart
    roles.forEach(async (role) => {
        try {
            const { message, channelID } = role;
            // Fetches channel
            const channel = await client.channels.fetch(channelID);
            if (!channel)
                return console.log(`Channel with ID ${channelID} not found.`);
            // Fetches message
            const roleMessage = await channel.messages.fetch(message);
            if (!message)
                return console.log(`Message with ID ${message} not found.`);
            // Finds the content and guild
            const guild = client.guilds.cache.get(roleMessage.guildId);
            const content = roleMessage.embeds[0].data.fields[0].value;
            if (!guild)
                return console.log(`Guild ${roleMessage.guildId} does not exist.`);
            // Finds the relevant roles on the server
            const roleRegex = /<@&(\d+)>/g;
            const messageRoles = content.match(roleRegex) || [];
            const roles = messageRoles.map((match) => match.slice(3, -1));
            // Finds the corresponding icons
            const icons = content.split('\n').map((icon) => icon[1] === ':' ? icon.split(':')[1] : icon.substring(0, 2));
            // Creates a collector that monitors the message for reactions
            const roleCollector = roleMessage.createReactionCollector({
                filter: (reaction, user) => !user.bot,
                dispose: true
            });
            roleCollector.on('collect', async (clickedReaction, user) => {
                const member = await guild.members.fetch(user.id);
                const emoji = clickedReaction._emoji.name;
                const reaction = emoji.length < 4 ? emoji.slice(0, 2) : emoji;
                console.log(icons);
                for (let i = 0; i < icons.length; i++) {
                    if (icons[i] === reaction) {
                        console.log(roles[i]);
                        member.roles.add(roles[i]);
                        break;
                    }
                }
            });
            roleCollector.on('remove', async (clickedReaction, user) => {
                const member = await guild.members.fetch(user.id);
                const emoji = clickedReaction._emoji.name;
                const reaction = emoji.length < 4 ? emoji.slice(0, 2) : emoji;
                for (let i = 0; i < icons.length; i++) {
                    if (icons[i] === reaction) {
                        member.roles.remove(roles[i]);
                        break;
                    }
                }
            });
        }
        catch (error) {
            // Removes deleted messages from storage
            const errorLinkArray = error.url.split('/');
            const messageIdToRemove = errorLinkArray[errorLinkArray.length - 1];
            for (let i = 0; i < roles.length; i++) {
                if (roles[i].message === messageIdToRemove) {
                    roles.splice(i, 1);
                    break;
                }
            }
        }
    });
    console.log("Ready!");
});
client.on(Events.InteractionCreate, async (message) => {
    if (!message.isChatInputCommand())
        return;
    const command = client.commands.get(message.commandName);
    if (!command)
        return;
    try {
        await command.execute(message);
    }
    catch (error) {
        // Ignoring error as another process is handling it
        // console.log(error)
    }
});
client.login(token);
export default client;
