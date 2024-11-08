import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import config from './utils/config.js';
import roles from './managed/roles.js';
import { Client, Collection, Events, GatewayIntentBits, Partials } from 'discord.js';
import addRole, { removeRole } from './utils/roles.js';
import autoCreateTekKomMeetings from './utils/autoCreateTekKomMeetings.js';
import handleComponents from './utils/handleComponents.js';
import getID from './utils/tickets/getID.js';
import validCommands, { exceptions } from './utils/valid.js';
import handleTickets from './utils/tickets/handler.js';
import autoSyncZammad from './utils/autoSyncZammad.js';
import autoCreateStyretMeetings from './utils/autoCreateStyretMeetings.js';
const token = config.token;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
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
    // Creates TekKom meeting agendas
    autoCreateTekKomMeetings(client);
    // Creates Styret meeting agendas
    autoCreateStyretMeetings(client);
    // Automatically syncronizes messages from Zammad to Discord
    autoSyncZammad(client);
    console.log("Ready!");
});
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() && !('customId' in interaction)) {
        console.error('NO CHAT LOL');
        return;
    }
    const command = client.commands.get(interaction.commandName);
    if (!command && !('customId' in interaction)) {
        console.error('NO COMMAND LOL');
        return;
    }
    if (validCommands.includes(interaction.commandName) || ('customId' in interaction && validCommands.includes(interaction.customId))) {
        return handleComponents(interaction, getID(interaction.commandName));
    }
    else {
        // @ts-expect-error
        const customId = interaction.customId;
        if (customId && !exceptions.includes(customId)) {
            // @ts-expect-error
            console.error(`${interaction.commandName || interaction.customId} is not a valid command in app.ts`);
        }
    }
    await command.execute(interaction);
});
// Sends a reminder in #pr-kontakt threads reminding them of the template.
client.on(Events.ThreadCreate, async (thread) => {
    // Checks if the channel is #pr-kontakt
    if (thread.parent?.name === 'pr-kontakt') {
        // Sends the reminder message
        return await thread.send({
            content: "Husk å ha med:\n```\nTittel: Thread tittel skal være arrangement / grunn for kontakt\nSted (Hvor skjer det?):\nDato og klokkeslett (Når skjer det?):\nBeskrivelse/promotekst (Hva er det?):\nRelease dato (Når er det ønsket at promo postes?):\n```"
        });
    }
});
// Sends a reminder in #saker-til-styremøter threads reminding them of the template.
client.on(Events.ThreadCreate, async (thread) => {
    // Checks if the channel is #pr-kontakt
    if (thread.parent?.name === 'saker-til-styremøter') {
        // Sends the reminder message
        return await thread.send({
            content: "Husk å ha med:\n```\nType sak: O / D / V - \nBeskrivelse av saken.\n\nEksempel:\nD - Nytt format av saker\nDenne linjen og resten av meldingen er innholdet i saken.```\nDersom du ønsker å redigere en sak må du redigere samme melding. Flere meldinger for samme sak vil ikke komme med. Meldinger uten type vil heller ikke komme med. Slike meldinger antas å være urelevant diskusjon.\n"
        });
    }
});
client.on(Events.MessageReactionRemove, async (reaction, user) => {
    // Checks if a reaction is partial, and if so fetches the entire structure
    if (reaction.partial) {
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
client.on(Events.MessageCreate, async (message) => {
    const regex = /^\d{5,6}(?!\w)/;
    const matches = message.content.match(regex);
    // Ticket handling
    handleTickets({ matches, message });
});
client.login(token);
process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Promise Rejection:\n", err);
});
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Promise Exception:\n", err);
});
process.on("uncaughtExceptionMonitor", async (err) => {
    console.error("Uncaught Promise Exception (Monitor):\n", err);
});
export default client;
