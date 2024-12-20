import { EmbedBuilder, Message } from "discord.js"
import { FALLBACK_PIPELINE, SUCCESS } from "../../../constants.js"
import getPipelines, { getBridgesForPipeline, getJobsForPipeline } from "./pipeline.js"
import { errorButtons, initialButtons, successButtons } from "./buttons.js"

export default async function editEverySecondTillDone(message: Message, user: string, id: number, tag: string, name: string, seconds: number = 1, prod?: true): Promise<boolean> {
    const startTime = new Date().getTime()
    const dev = prod ? '' : '-dev'

    async function edit() {
        let pipeline
        const pipelines = await getPipelines(id)

        for (const pi of pipelines) {
            if (pi.ref === `${tag}${dev}`) {
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
        const Seconds = Math.floor((time - startTime) / 1000)
        const error = pipeline.status !== SUCCESS && pipeline.status !== 'running' && pipeline.status !== 'pending'
        const embed = new EmbedBuilder()
            .setTitle(formatTitle(pipeline, tag, name, dev))
            .setDescription(formatDescription(pipeline, Seconds))
            .setColor("#fd8738")
            .setTimestamp()
            .setURL(pipeline.web_url)
            .addFields([
                {name: "Status", value: pipeline.status, inline: true},
                ...formatJobs(jobs.sort((a, b) => a.id - b.id), seconds)
            ])

        try {
            if (message.embeds.length > 1) {
                message.embeds.pop()
            }

            message.edit({
                embeds: [...embeds, embed], 
                components: error 
                    ? [errorButtons] 
                    : pipeline.status === SUCCESS 
                        ? [successButtons]
                        : [initialButtons]
            })
        } catch (error) {
            console.error(`Discord message for ${name}, version ${tag}${dev} was deleted. Continuing on Gitlab, check UI for results.`)
            return false
        }

        switch (pipeline.status) {
            case SUCCESS:
                console.log(`${name} version ${tag}${dev} deployed by ${user} completed successfully after ${seconds}s (Repository ID ${id}).`)
                return true
            case 'canceled':
                console.warn(`Deployment of ${name} version ${tag}${dev} deployed by ${user} was canceled after ${seconds}s (Repository ID ${id}).`)
                return false
            case 'failed':
                console.error(`Deployment of ${name} version ${tag}${dev} deployed by ${user} failed after ${seconds}s (Repository ID ${id}).`)
                return false
        }
    }

    return new Promise<boolean>((resolve) => {
        const startTime = new Date().getTime()
        const interval = setInterval(async () => {
            const elapsed = new Date().getTime() - startTime
            const hourTimeout = elapsed > 3600000
            const result = await edit()
            
            if (typeof result === 'boolean') {
                resolve(result)
                clearInterval(interval)
            }

            if (hourTimeout) {
                console.error(`Deployment of ${name} version ${tag}${dev} deployed by ${user} timed out after 1 hour (Repository ID ${id}).`)
                resolve(false)
                clearInterval(interval)
            }
        }, seconds * 1000)
    })
}

function formatDescription(pipeline: Pipeline, seconds: number) {
    switch (pipeline.status) {
        case SUCCESS: return `Deployed successfully in ${seconds}s.`
        case 'canceled': return `Cancelled after ${seconds}s.`
        case 'failed': return `Failed after ${seconds}s.`
        default: return `(${seconds}s) Currently deploying ...`
    }
}

function formatTitle(pipeline: Pipeline, tag: string, name: string, dev: string) {
    switch (pipeline.status) {
        case SUCCESS: return `Successfully deployed version ${tag}${dev} of ${name}`
        case 'failed': return `Failed deployment of version ${tag}${dev} for ${name}`
        case 'canceled': return `Deployment of version ${tag}${dev} for ${name} was cancelled.`
        default: return `Deploying ${tag}${dev} for ${name}`
    }
}

function formatJobs(jobs: Job[], seconds: number) {
    let job = ""
    let descriptions = ""

    let i = 0
    while (jobs && i < jobs.length) {
        const Job = jobs[i]
        job += `${Job.id}, ${Job.stage}\n`
        const formatStatus = FormatStatus(Job, seconds)
        descriptions += `${formatStatus.slice(0, 42).trim()}${formatStatus.length > 42 ? '…' : ''}\n`
        i++
    }

    return [
        {name: "Job", value: job, inline: true},
        {name: "Info", value: descriptions, inline: true}
    ]
}

function FormatStatus(job: Job, seconds: number) {
    const duration = Math.floor(job.duration)
    const queuedDuration = Math.floor(job.queued_duration)

    switch (job.status) {
        case SUCCESS: return `Success (${duration}s)`
        case "created": return `Created (0s)`
        case "pending": return `Pending (${queuedDuration}s)`
        case "running": return `Running (${duration}s)`
        case "canceled": return `Cancelled after ${duration || queuedDuration || seconds}s`
        case "skipped": return `Skipped after ${duration || queuedDuration || seconds}s`
        default: return `Error: ${job.status} after ${duration || queuedDuration || seconds}s.`
    }
}
