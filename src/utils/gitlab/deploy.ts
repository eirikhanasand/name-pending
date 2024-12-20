import { ButtonInteraction, EmbedBuilder } from "discord.js"
import { postTag } from "./tags.js"
import { initialButtons } from "./buttons.js"
import editEverySecondTillDone from "./editEverySecondTillDone.js"

export default async function deploy(interaction: ButtonInteraction, tag: string, name: string, id: number, dev: string, rerun?: true) {
    const message = interaction.message
    const title = `Deploying v${tag}${dev} for ${name}`
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(`(0s) Currently deploying ...`)
        .setColor("#fd8738")
        .setTimestamp()
    
    await postTag(id, `${tag}${dev}`)

    const embeds = message.embeds

    rerun && embeds.pop()
    embeds.length > 1 && embeds.pop()
    message.edit({
        embeds: [...embeds, embed], 
        components: [initialButtons]
    })
    console.warn(`${interaction.user.username} started ${rerun ? 're' : ''}deploying ${tag}${dev} for ${name} (Repository ID ${id}).`)
    interaction.deferUpdate()

    if (rerun) {
        setTimeout(async() => {
            await editEverySecondTillDone(interaction.message, interaction.user.username, id, tag, name || '', 1)
        }, 10000)
    } else {
        await editEverySecondTillDone(interaction.message, interaction.user.username, id, tag, name || '', 1)
    }
}
