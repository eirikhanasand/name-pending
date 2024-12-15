import { GITLAB_API } from "../../constants.js"
import config from "./config.js"

export default async function getOpenMergeRequests(projectId: number): Promise<MergeRequest[]> {
    try {
        const mergeRequests: MergeRequest[] = []
        let page = 1

        while (true) {
            const response = await fetch(`${GITLAB_API}projects/${projectId}/merge_requests?state=opened&per_page=25&page=${page}`, {
                headers: {
                    'Private-Token': config.privateToken
                }
            })

            if (!response.ok) {
                throw new Error(await response.text())
            }

            const data = await response.json()

            if (data.length === 0) {
                break
            }

            mergeRequests.push(...data)
            page++
        }

        return mergeRequests
    } catch (error) {
        console.error("Error fetching merge requests:", error)
        return []
    }
}
