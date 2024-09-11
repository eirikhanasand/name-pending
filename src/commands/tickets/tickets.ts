import { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChatInputCommandInteraction, 
    EmbedBuilder, 
    SlashCommandBuilder 
} from "discord.js"

export const data = new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Creates the ticket system.')

export async function execute(message: ChatInputCommandInteraction) {
    create(message)
}

async function create(message: ChatInputCommandInteraction) {
    // Funksjon som lager selve ticket systemet

    const embed = new EmbedBuilder()
        .setTitle('Support tickets')
        .setDescription('Feel free to open a support ticket if you have encountered any problems, need someone to do something, or have any questions, and we will reach out to you as soon as possible.')
        .setColor("#fd8738")
        .setTimestamp()
        .addFields(
            { name: "Create", value: "Creates a new ticket" }, 
            { name: "View", value: "Views existing ticket, pings you in the channel if already open, or adds you to the channel if not" },
            // also adds button to remove yourself from the channel or reopen it 
            { name: "Tag", value: "Tags a ticket with a topic" }, 
            { name: "Close", value: "Closes a ticket" }, 
            { name: "Reopen", value: "Reopens a ticket" }, 
            // ... er allerede i ticketen, vil du legge til flere (Ja/Nei) - tekstfelt for å pinge roller som eventuelt skal legges til
        )

    // 'Create ticket' button
    const create = new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
    // 'View tickets' button
    const view = new ButtonBuilder()
        .setCustomId('view_ticket')
        .setLabel('View tickets')
        .setStyle(ButtonStyle.Secondary)

    // 'Close ticket' button
    const close = new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Close Ticket')
        .setStyle(ButtonStyle.Secondary)
    
    // 'Reopen ticket' button
    const reopen = new ButtonBuilder()
        .setCustomId('reopen_ticket')
        .setLabel('Reopen Ticket')
        .setStyle(ButtonStyle.Secondary)

    // Creates the button row in UI
    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(create, view, close, reopen)
    await message.reply({ embeds: [embed], components: [buttons] })
}
