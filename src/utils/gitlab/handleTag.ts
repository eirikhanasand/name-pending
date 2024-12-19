import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, Message } from "discord.js";
import { Increment } from "../../../interfaces.js";
import { deleteTag, postTag } from "./tags.js";
import getPipelines, { getBridgesForPipeline, getJobsForPipeline } from "./pipeline.js";
import { FALLBACK_PIPELINE, SUCCESS } from "../../../constants.js";

export default async function handleTag(interaction: ButtonInteraction, type: Increment) {
    try {
        let index

        switch (type) {
            case Increment.MAJOR: index = 0; break;
            case Increment.MINOR: index = 1; break;
            case Increment.PATCH: index = 2; break;
        }

        const message = interaction.message
        // @ts-expect-error
        const embedTag = message.components[0].components[index].data.label
        const name = message.embeds[0].title
        const id = Number(message.embeds[0].fields[0].value)
        const tag = embedTag.match(/\(([^)]+)\)/)?.[1]
        const title = `Deploying v${tag}-dev for ${name?.slice(28)}.`
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(`0s Currently deploying ...`)
            .setColor("#fd8738")
            .setTimestamp()
        
        await postTag(id, `${tag}-dev`)

        // Creates 'cancel' button
        const cancel = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)

        // Creates 'trash' button
        const trash = new ButtonBuilder()
            .setCustomId('trash')
            .setLabel('🗑️')
            .setStyle(ButtonStyle.Secondary)
        
        const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel, trash)

        message.edit({embeds: [...message.embeds, embed], components: [buttons]})
        interaction.deferUpdate()

        editEverySecondTillDone(message, title, id, tag, 1)
    } catch (error) {
        console.error(error)
    }
}

export async function removeTag(interaction: ButtonInteraction) {
    const message = interaction.message
    const embedTag = message.embeds[1].title || ''
    const id = Number(message.embeds[0].fields[0].value)
    const tag = embedTag.match(/\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?/) || ''
    await deleteTag(id, Array.isArray(tag) ? tag[0] : '')

    // Creates 'cancel' button
    const cancel = new ButtonBuilder()
        .setCustomId('error')
        .setLabel('Aborted.')
        .setStyle(ButtonStyle.Danger)

    // Creates 'trash' button
    const trash = new ButtonBuilder()
        .setCustomId('trash')
        .setLabel('🗑️')
        .setStyle(ButtonStyle.Secondary)

    const buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(cancel, trash)

    await interaction.message.edit({components: [buttons]})
    await interaction.deferUpdate()
}

async function editEverySecondTillDone(message: Message, title: string, id: number, tag: string, seconds: number = 1000) {
    const startTime = new Date().getTime()
    setInterval(async() => {
        let pipeline
        const pipelines = await getPipelines(id)

        for (const pi of pipelines) {
            if (pi.ref === `${tag}-dev`) {
                pipeline = pi
            }
        }

        if (!pipeline) {
            pipeline = FALLBACK_PIPELINE
        }

        const [Jobs, bridges] = await Promise.all([
            await getJobsForPipeline(id, pipeline.id),
            await getBridgesForPipeline(id, pipeline.id)
        ])
        // @ts-expect-error
        const downstream_id = bridges[0]?.downstream_pipeline?.project_id
        // @ts-expect-error
        const downstream_pipeline_id = bridges[0]?.downstream_pipeline?.id
        const downstream = downstream_id && downstream_pipeline_id ? await getJobsForPipeline(downstream_id, downstream_pipeline_id) : []
        const jobs = [...Jobs, ...bridges, ...downstream]
        const embeds = message.embeds
        const time = new Date().getTime()
        const embed = new EmbedBuilder()
            .setTitle(title.slice(0, title.length - 1))
            .setDescription(`(${Math.floor((time - startTime) / 1000)}s) ${pipeline.status === SUCCESS ? 'Deployed.' : 'Currently deploying ...'}`)
            .setColor("#fd8738")
            .setTimestamp()
            .setURL(pipeline.web_url)
            .addFields([
                {name: "Status", value: pipeline.status, inline: true},
                ...formatJobs(jobs.sort((a, b) => a.id - b.id))
            ])

        try {
            message.edit({embeds: [...embeds.slice(0, embeds.length - 1), embed]})
        } catch (error) {
            console.log("Message deleted, aborting interval update.")
            return
        }

        if (pipeline.status === SUCCESS) return
    }, seconds * 1000)
}

function formatJobs(jobs: Job[]) {
    let job = ""
    let descriptions = ""

    let i = 0
    while (jobs && i < jobs.length) {
        const Job = jobs[i]
        job += `${Job.id}, ${Job.stage}\n`
        const formatStatus = FormatStatus(Job)
        descriptions += `${formatStatus.slice(0, 42).trim()}${formatStatus.length > 42 ? '…' : ''}\n`
        i++
    }

    return [
        {name: "Job", value: job, inline: true},
        {name: "Info", value: descriptions, inline: true}
    ]
}

function FormatStatus(job: Job) {
    const duration = Math.floor(job.duration)
    const queuedDuration = Math.floor(job.queued_duration)

    switch (job.status) {
        case SUCCESS: return `Success (${duration}s)`
        case "created": return `Created (0s)`
        case "pending": return `Pending (${queuedDuration}s)`
        case "running": return `Running (${duration}s)`
        default: return `Error occured with job ${job.stage}: ${job.status}. Manual resolution required.`
    }
}
