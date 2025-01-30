import { ButtonInteraction, Role } from "discord.js"
import { Increment, Roles } from "../../../interfaces.js"
import { deleteTag } from "./tags.js"
import deploy from "./deploy.js"
import { abortButtons, errorButtons } from "./buttons.js"
import config from "../config.js"

export default async function handleTag(interaction: ButtonInteraction, type: Increment) {
    try {
        let index

        switch (type) {
            case Increment.MAJOR: index = 0; break
            case Increment.MINOR: index = 1; break
            case Increment.PATCH: index = 2; break
        }

        const message = interaction.message
        // @ts-expect-error
        const embedTag = message.components[0].components[index].data.label
        const name = message.embeds[0].title || 'unknown'
        const id = Number(message.embeds[0].fields[0].value)
        const tag = embedTag.match(/\(([^)]+)\)/)?.[1]
        await deploy(interaction, tag, name?.slice(28), id, '-dev')
    } catch (error) {
        console.error(error)
    }
}

export async function removeTag(interaction: ButtonInteraction) {
    const message = interaction.message
    const isAllowed = (message.member?.roles as unknown as Roles)?.cache.some((role: Role) => role.id === config.roleID)
    if (!isAllowed) {
        return await interaction.reply({ content: "Unauthorized.", ephemeral: true })
    }

    const embedTag = message.embeds[1].title || ''
    const id = Number(message.embeds[0].fields[0].value)
    const tag = embedTag.match(/\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?/) || ''
    await deleteTag(id, Array.isArray(tag) ? tag[0] : '')

    await interaction.message.edit({components: [abortButtons]})
    await interaction.deferUpdate()
    setTimeout(async() => {
        await interaction.message.edit({components: [errorButtons]})
    }, 3000)
}
