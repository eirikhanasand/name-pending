import { ButtonInteraction, ChatInputCommandInteraction } from "discord.js"
import { nextPage, previousPage } from "./help.js"
import trash from "./trash.js"

export default async function handleComponents(interaction: ButtonInteraction | ChatInputCommandInteraction, id: string | undefined) {    
    const buttonInteraction = interaction as ButtonInteraction

    // id is present if interaction is ChatInputCommandInteraction
    switch (id || buttonInteraction.customId) {
        case 'next_page_help':
            await nextPage(buttonInteraction)
            break
        case 'previous_page_help':
            await previousPage(buttonInteraction)
            break
        case 'error':
        case 'trash':
            trash(buttonInteraction)
            break
        default:
            console.error(`${buttonInteraction.customId || id} is unhandled in handleComponents.`)
            await buttonInteraction.reply({ content: `Unknown action. ${buttonInteraction.customId}`, ephemeral: true })
            break
    }
}
