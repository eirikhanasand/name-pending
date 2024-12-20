import { GITLAB_API, INFRA_PROD_CLUSTER } from "../../../constants.js"
import config from "../config.js"
import logNullValue from "../logNullValue.js"

export default async function postMerge(id: number) {
    try {
        logNullValue("postMerge", ["id"], [id])
        console.warn("Merging", `${GITLAB_API}projects/${INFRA_PROD_CLUSTER}/merge_requests/${id}`)
        const response = await fetch(`${GITLAB_API}projects/${INFRA_PROD_CLUSTER}/merge_requests/${id}/merge`, {
            method: 'PUT',
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
    }
}
