import { GITLAB_API } from "../../../constants.js"
import config from "../config.js"
import logNullValue from "../logNullValue.js"

export default async function getRepositories(limit: number, query: string): Promise<RepositorySimple[]> {
    try {
        logNullValue("getRepositories", ["limit"], [limit])
        const search = query ? `&search=${query}` : ''
        const response = await fetch(`${GITLAB_API}projects?simple=true${search}`, {
            headers: {
                'Private-Token': config.privateToken
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()
        return data.slice(0, limit)
    } catch (error) {
        console.error(error)
        return []
    }
}
