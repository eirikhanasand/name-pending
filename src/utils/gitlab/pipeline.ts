import { GITLAB_API } from "../../../constants.js";
import config from "../config.js";

export default async function getPipelines(id: number): Promise<Pipeline[]> {
    try {
        const response = await fetch(`${GITLAB_API}projects/${id}/pipelines`, {
            headers: {
                'Private-Token': config.privateToken,
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getJobsForPipeline(projectID: number, id: number): Promise<Job[]> {
    try {
        const response = await fetch(`${GITLAB_API}projects/${projectID}/pipelines/${id}/jobs`, {
            headers: {
                'Private-Token': config.privateToken,
            }
        })
    
        if (!response.ok) {
            throw new Error(await response.text())
        }
    
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getBridgesForPipeline(projectID: number, id: number): Promise<Job[]> {
    try {
        const response = await fetch(`${GITLAB_API}projects/${projectID}/pipelines/${id}/bridges`, {
            headers: {
                'Private-Token': config.privateToken,
            }
        })
    
        if (!response.ok) {
            throw new Error(await response.text())
        }
    
        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}