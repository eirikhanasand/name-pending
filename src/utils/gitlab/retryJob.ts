import { GITLAB_API } from "../../../constants.js"
import config from "../config.js"
import logNullValue from "../logNullValue.js"

export default async function retryJob(projectId: number, jobId: number) {
    try {
        logNullValue("getTags", ["projectId", "jobId"], [projectId, jobId])
        const response = await fetch(`${GITLAB_API}projects/${projectId}/jobs/${jobId}/retry`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Private-Token': config.privateToken,
            }
        })
    
        if (!response.ok) {
            throw new Error(`Failed to retry job with ID: ${jobId}`)
        }
    
        const data = await response.json()
        return data
    } catch (error) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.error(error)
        }
    }
}
