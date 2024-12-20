import { ButtonInteraction } from "discord.js"
import deploy from "./deploy.js"
import getPipelines, { getJobsForPipeline } from "./pipeline.js"
import formatVersion from "./formatVersion.js"
import retryJob from "./retryJob.js"

export default async function retryDeployment(interaction: ButtonInteraction) {
    const message = interaction.message
    const name = message.embeds[0].title || 'unknown'
    const id = Number(message.embeds[0].fields[0].value)
    const tag = formatVersion(message.embeds[1].title || '').join('.') || 'unknown'

    deploy(interaction, tag, name, id, message.embeds[1].title?.includes('-dev') ? '-dev' : '', true)
    resumeStoppedPipelines(id)
    interaction.deferUpdate()
}

export async function resumeStoppedPipelines(id: number) {
    const pipelines = await getPipelines(id)
    const jobs = await getJobsForPipeline(id, pipelines[0].id)

    for (const job of jobs) {
        if (job.status === 'failed') {
            retryJob(id, job.id)
        }
    }
}
