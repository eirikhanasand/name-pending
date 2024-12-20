import { GITLAB_API } from "../../../constants.js"
import config from "../config.js"
import logNullValue from "../logNullValue.js"

export default async function getCommits(id: number): Promise<Commit[]> {
    try {
        logNullValue("getCommits", ["id"], [id])
        const response = await fetch(`${GITLAB_API}projects/${id}/repository/commits?per_page=5`, {
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
        if (!JSON.stringify(error).includes('Skipped')) {
            console.error(error)
        }

        return []
    }
}
