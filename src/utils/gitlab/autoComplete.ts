import getRepositories from "./getRepositories.js"
import getOpenMergeRequests from "./getMergeRequests.js"
import { AutocompleteInteraction } from "discord.js"
import { INFRA_PROD_CLUSTER } from "../../../constants.js"
import sanitize from "../sanitize.js"

const REPOSITORY = "repository"
const DEPLOY = "deploy"

export default async function Autocomplete(interaction: AutocompleteInteraction<"cached">) {
    const focusedName = interaction.options.getFocused(true).name
    const query = sanitize(interaction.options.getFocused(true).value).toLowerCase()
    let relevant = new Set<RepositorySimple>()
    const isDeploy = interaction.commandName === DEPLOY
    const [repositories, mergeRequests] = await Promise.all([
        getRepositories(25, query),
        getOpenMergeRequests(INFRA_PROD_CLUSTER),
    ])
    const fallbackResult = `No repositories ${query.length > 0 ? `matching '${query}'` : ''} are ready for ${isDeploy ? 'deployment' : 'release'}.`

    // Autocompletes repositories
    if (focusedName === REPOSITORY) {
        if (query.length) {
            for (const repo of repositories) {
                const name = repo.name.toLowerCase()
                if (isDeploy) {
                    if (name.includes(query)) {
                        relevant.add(repo)
                    }

                    continue
                }

                for (const mr of mergeRequests) {
                    const title = mr.title.toLowerCase()
                    if (name.includes(query) && title.includes(name)) {
                        relevant.add(repo)
                    }
                }
            }
        } else {
            if (isDeploy) {
                relevant = new Set(repositories)
            } else {
                for (const repo of repositories) {
                    const name = repo.name.toLowerCase()
                    for (const mr of mergeRequests) {
                        if (mr.title.includes(name)) {
                            relevant.add(repo)
                        }
                    }
                }
            }
        }
    }

    /**
    {
        id: repository.id,
        name: repository.name,
        path_with_namespace: repository.path_with_namespace,
        default_branch: repository.default_branch,
        ssh_url_to_repo: repository.ssh_url_to_repo,
        web_url: repository.web_url,
        container_registry_image_prefix: repository.container_registry_image_prefix,
        _links: {
            self: repository._links.self,
            issues: repository._links.issues,
            merge_requests: repository._links.merge_requests,
            repo_branches: repository._links.repo_branches
        }
    }
    */

    if (!relevant.size) {
        return await interaction.respond([{name: fallbackResult, value: fallbackResult}])
    }

    const seen: string[] = []
    const uniqueResponse: {name: string, value: string}[] = []
    Array.from(relevant).slice(0, 25).map((item: RepositorySimple) => {
        const name = item.name
        if (!seen.includes(name)) {
            seen.push(name)
            uniqueResponse.push({
                name: name, 
                value: name
            })
        }
    })

    await interaction
        .respond(uniqueResponse)
        .catch(console.error)
}
