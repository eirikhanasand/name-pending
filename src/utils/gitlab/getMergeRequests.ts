import { GITLAB_API } from "../../constants.js"
import config from "../config.js"
import logNullValue from "../logNullValue.js"

export default async function getOpenMergeRequests(projectId: number): Promise<MergeRequest[]> {
    try {
        logNullValue("getOpenMergeRequests", ["projectId"], [projectId])
        const response = await fetch(`${GITLAB_API}projects/${projectId}/merge_requests?state=opened&per_page=25`, {
            headers: {
                'Private-Token': config.privateToken
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data
    } catch (error) {
        if (!JSON.stringify(error).includes('Skipped')) {
            console.error(error)
        }

        return []
    }
}
