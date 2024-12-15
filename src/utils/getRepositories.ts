import { GITLAB_API } from "../../constants.js"
import config from "./config.js"

export default async function getRepositories(query?: string): Promise<Repository[]> {
    try {
        const repositories: Repository[] = []
        const search = query ? `&search=${encodeURIComponent(query)}` : ''
        const response = await fetch(`${GITLAB_API}projects?membership=true&per_page=25${search}`, {
            headers: {
                'Private-Token': config.privateToken
            }
        })

        if (!response.ok) {
            throw new Error(await response.text())
        }

        const data = await response.json()

        repositories.push(...data)

        return repositories
    } catch (error) {
        console.error(error)
        return []
    }
}
