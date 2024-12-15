import getRepositories from "./getRepositories.js"
import getOpenMergeRequests from "./getMergeRequests.js"
import { AutocompleteInteraction } from "discord.js"
import { INFRA_PROD_CLUSTER } from "../../constants.js"

type Item = Repository | MergeRequest

export default async function Autocomplete(interaction: AutocompleteInteraction<"cached">) {
    const focusedName = interaction.options.getFocused(true).name
    const query = interaction.options.getFocused(true).value
    const repository = interaction.options.get('repository')?.value as string || ""
    let relevant = [] as Item[]

    // Autocompletes repositories
    if (focusedName === "repository") {
        const branch = interaction.options.getString("branch") || "main";
        const repositories = await getRepositories()

        if (query.length) {
            for (const repo of repositories) {
                if (repo.name.includes(query)) {
                    relevant.push(repo)
                }
            }
        } else {
            relevant = repositories
        }
    }

    // Autocompletes versions
    if (focusedName === "version") {
        const mergeRequests = await getOpenMergeRequests(INFRA_PROD_CLUSTER)

        if (query.length) {
            for (const mr of mergeRequests) {
                if (mr.title.includes(query) && mr.title.includes(repository)) {
                    relevant.push(mr)
                }
            }
        } else {
            for (const mr of mergeRequests) {
                if (mr.title.includes(repository)) {
                    relevant.push(mr)
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

   const versionRegex = /v(\d+\.\d+\.\d+)/
    await interaction
        .respond(
            relevant.slice(0, 25).map((item: Item) => {
                // @ts-expect-error
                const name = focusedName === "repository" ? item.name : (item.title.match(versionRegex)[1] ?? "unknown")
                return ({
                    name: name, 
                    value: name
                })
            })
        )
        .catch(console.error)
}
