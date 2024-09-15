import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import pages from "./commands.js";
const commands = {
    add: "Adds member or roles to the current channel. An interactive menu will be provided when you run: `/add`",
    addviewer: "Adds member or roles to the current channel without pinging them. An interactive menu will be provided when you run: `/addviewer`",
    chat: "Establishes a link between the current channel and the Minecraft survival and creative servers. Use the command by typing the following: `/chat`. The link will be established automatically.",
    close: "Closes a ticket. Use the command by typing the following: `/close`. The ticket will be closed automatically, and can be reopened by using the `/reopen` command. See `/help reopen` for more information.",
    create: "Creates a new ticket. Use the command by typing the following: `/create`. You will be asked to enter the title of the ticket, and the ticket will be created automatically. You can enter the content, tag the ticket and add people to the ticket after creating it.",
    get: "**UNIMPLEMENTED** Gets all your tickets. Use the command by typing the following: `/get`",
    syntax: "`/help command:name`\n",
    history: "Displays history about the bot. Use the command by typing the following: `/history`",
    info: "Displays info about the bot. Use the command by typing the following: `/info`",
    log: "Starts logging the whitelist messages in the chat where the command was sent. Use the command by typing the following: `/log`",
    notify: "Sends a notification to the Login app. Use the command by typing the following: `/notify title:your_title_here desscription:your_description_here topic:your_topic_here data:your_json_object_here`. The title, description and topic are required, but data is optional, and only required to navigate to something automatically in the app.",
    ping: "Pings the bot. The bot replies 'Pong!' if online. Use the command by typing the following: `/ping`",
    reopen: "Reopens a archived ticket. Use the command by typing the following: `/reopen`. An interactive menu will be provided where you can select the ticket you want to reopen.",
    roles: "Creates a role builder message. Use the command by typing the following: `/roles`. Only available to TekKom-Verv. Takes the title, description, roles and icons parameters. This is the title and description at the top of the message, and then the roles and icons are mapped to each other 1 to 1.",
    registry: "Displays how to interact with Logins gitlab registry. Use the command by typing the following: `/registry`",
    remove: "Removes a user or role from the current ticket. Use the command by typing the following: `/remove`. This will display an interactive menu where you can select the user or role you want to remove. They will **not** be notified.",
    setup: [
        { name: "Setup", value: "Sets up the specified service. Use the command by typing the following: `/setup service:name`" },
        { name: "Available services", value: " " },
        { name: "chat", value: "Sets up a chat service that mirrors in game messages from both the creative and survival server to Discord, and mirrors the Discord server to in game." },
        { name: "log", value: "Logs the whitelist messages in the chat where the command was sent." },
        { name: "chat stop mirror", value: "Stops the bot from mirroring in game messages to Discord" },
        { name: "chat stop listener", value: "Stops the bot from mirroring Discord messages to in game" }
    ],
    tag: "Info on how to tag a git commit. Use the command by typing the following: `/tag`. All info will be displayed in the message.",
    tagticket: "Adds tags to the current ticket. Use the command by typing the following: `/tagticket`. An interactive list of available tags will be provided.",
    ticket: "Creates a new ticket. Use the command by typing the following: `/ticket`. A modal will pop up asking you to enter the title of the ticket, and the ticket will be created automatically. You can enter the content, tag the ticket and add people to the ticket after creating it.",
    updaterolemessage: "Updates a role builder message. Use the command by typing the following: `/updaterolemessage`. Only available to TekKom-Verv. Takes the title, description, roles and icons parameters. This is the title and description at the top of the message, and then the roles and icons are mapped to each other 1 to 1.",
    version: "Displays the bots version number. Use the command by typing the following: `/version`",
    view: "Select the ticket you want to view. Use the command by typing the following: `/view`. An interactive list of available tickets will be provided.",
    whitelist: "Whitelists the user specified. Use the command by typing the following: `/whitelist user:name`",
    whitelist_remove: "Removes the specified user from the whitelist. Use the command by typing the following: `/whitelist_remove user:name`",
    name: "'name' is a placeholder, please replace it with the command you want help for. For example for help on the ping command, write `/help command:ping`",
    invite: "Creates an invite to a ticket that you have access to. Use the command by typing `/invite`. This lets people decide on their own if they want to participate. Will prompt you for the channel to invite to when you run the command.",
    leave: "Leaves a ticket. Can only be used in ticket channels. Use the command by typing `/leave`. Useful if you temporarily want to assist with something, but the ticket is otherwise unrelevant to you. Sends a message to the channel that you left the ticket."
};
export default function getEmbed(command, page = 0) {
    if (command === 'name') {
        return createEmbed("Help", "Displays how to use the command specified", [{ name: `Showing page ${page + 1} / 3`, value: commands["name"], inline: false }]);
    }
    if (command === undefined) {
        return createEmbed("Help", "Displays how to use the command specified", [{ name: `Showing page ${page + 1} / 3`, value: getPage(page).join('\n'), inline: false }]);
    }
    if (commands[command] === undefined) {
        return createEmbed("Help", "Displays how to use the command specified", [{ name: "Invalid command", value: pages[0].join('\n'), inline: false }]);
    }
    if (Array.isArray(commands[command])) {
        return createEmbed("Help", `Help for **${command}**`, commands[command]);
    }
    return createEmbed("Help", `Help for **${command}**`, [{ name: command, value: commands[command], inline: false }]);
}
function createEmbed(title, description, fields) {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor("#fd8738")
        .setTimestamp();
    for (const field of fields) {
        embed.addFields({
            name: field.name,
            value: field.value,
            inline: field.inline ? field.inline : false,
        });
    }
    return embed;
}
function getPage(page) {
    return pages[page];
}
export function getButtons(page) {
    const previous = new ButtonBuilder()
        .setCustomId('previous_page_help')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Secondary);
    const next = new ButtonBuilder()
        .setCustomId('next_page_help')
        .setLabel('Next')
        .setStyle(ButtonStyle.Secondary);
    const buttons = new ActionRowBuilder();
    if (page > 0 && page < pages.length - 1) {
        buttons.addComponents(previous, next);
    }
    else if (page > 0) {
        buttons.addComponents(previous);
    }
    else if (page < pages.length) {
        buttons.addComponents(next);
    }
    return [buttons];
}
export async function nextPage(interaction) {
    // Fetches the current page from the message
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0]);
    const previousPage = page + 1;
    // Fetches new content
    const newEmbed = getEmbed(undefined, previousPage);
    const newButtons = getButtons(previousPage);
    // Updates the message
    await interaction.update({ embeds: [newEmbed], components: newButtons });
}
export async function previousPage(interaction) {
    // Fetches the current page from the message
    const page = extractPageNumberFromEmbed(interaction.message.embeds[0]);
    const previousPage = page - 1;
    // Fetches new content
    const newEmbed = getEmbed(undefined, previousPage);
    const newButtons = getButtons(previousPage);
    // Updates the message
    await interaction.update({ embeds: [newEmbed], components: newButtons });
}
function extractPageNumberFromEmbed(embed) {
    const pageField = embed.data.fields?.find(field => field.name.startsWith('Showing page'));
    if (pageField) {
        const match = pageField.name.match(/Showing page (\d+) \/ \d+/);
        if (match && match[1]) {
            // Converts 1-based page to 0-based and returns it
            return parseInt(match[1], 10) - 1;
        }
    }
    // Defaults to the first page if no match is found
    return 0;
}
