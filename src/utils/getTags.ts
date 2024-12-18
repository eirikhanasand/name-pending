import { GITLAB_API } from "../../constants.js"

export default async function getTags(id: number): Promise<Tag[]> {
    try {
        const response = await fetch(`${GITLAB_API}projects/${id}/repository/tags`)

        if (!response.ok) {
            throw new Error(`Failed to fetch tags for ID: ${id}, ${(await response.text()).slice(0, 500)}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error(error)
        return []
    }
}
