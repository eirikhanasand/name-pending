import { GITLAB_API } from "../../constants.js"

export default async function getCommits(id: number): Promise<Commit[]> {
    try {
        const response = await fetch(`${GITLAB_API}projects/${id}/repository/commits`)

        if (!response.ok) {
            throw new Error(`Failed to fetch commits for ID: ${id}, ${(await response.text()).slice(0, 500)}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}
