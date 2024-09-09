import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import config from './utils/config.js';
import roles from './managed/roles.js';
import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import addRole, { removeRole } from './utils/roles.js';
import autoCreateMeetings from './utils/autoCreateMeetings.js';
const token = config.token;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User
    ],
});
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
    for (const role of roles) {
        try {
            const { message, channelID } = role;
            // Fetch channel and message
            const channel = await client.channels.fetch(channelID);
            if (!channel) {
                return console.log(`Channel with ID ${channelID} not found.`);
            }
            const roleMessage = await channel.messages.fetch(message);
            if (!roleMessage) {
                return console.log(`Message with ID ${message} not found.`);
            }
            // Fetches missing partial data for the message
            if (roleMessage.partial) {
                try {
                    await roleMessage.fetch();
                }
                catch (error) {
                    console.error(`Something went wrong when fetching role message partial: ${error}`);
                    return;
                }
            }
            // Extract guild, roles, and icons
            const guild = client.guilds.cache.get(roleMessage.guildId);
            const content = roleMessage.embeds[0].data.fields[0].value;
            if (!guild) {
                return console.log(`Guild ${roleMessage.guildId} does not exist.`);
            }
            const roleRegex = /<@&(\d+)>/g;
            const messageRoles = content.match(roleRegex) || [];
            const roleIds = messageRoles.map((match) => match.slice(3, -1));
            const icons = content.split('\n').map((icon) => icon[1] === ':' ? icon.split(':')[1] : icon.substring(0, 2));
            // Create a reaction collector
            const roleCollector = roleMessage.createReactionCollector({
                filter: (reaction, user) => !user.bot,
                dispose: true,
            });
            addRole({ collector: roleCollector, guild, roles: roleIds, icons });
        }
        catch (error) {
            console.error("Error processing roles:", error);
        }
    }
    autoCreateMeetings(client);
    console.log("Ready!");
});
client.on(Events.InteractionCreate, async (message) => {
    if (!message.isChatInputCommand()) {
        return;
    }
    const command = client.commands.get(message.commandName);
    if (!command)
        return;
    try {
        await command.execute(message);
        // Catched elsewhere
    }
    catch (_) { }
});
client.on(Events.MessageReactionRemove, async (reaction, user) => {
    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        }
        catch (error) {
            console.error('Something went wrong when fetching the message:', error);
            return;
        }
    }
    removeRole({ reaction, user });
});
client.login(token);
export default client;
