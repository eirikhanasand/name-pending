import getRepositories from "./getRepositories.js"
import getOpenMergeRequests from "./getMergeRequests.js"
import { AutocompleteInteraction } from "discord.js"
import { INFRA_PROD_CLUSTER } from "../../../constants.js"
import sanitize from "../sanitize.js"

type Item = RepositorySimple | MergeRequest
const REPOSITORY = "repository"
const DEPLOY = "deploy"
const VERSION = "version"
const versionRegex = /v(\d+\.\d+\.\d+)/

export default async function Autocomplete(interaction: AutocompleteInteraction<"cached">) {
    const focusedName = interaction.options.getFocused(true).name
    const query = sanitize(interaction.options.getFocused(true).value).toLowerCase()
    const repository = (interaction.options.get('repository')?.value as string).toLowerCase() || ""
    let relevant = [] as Item[]
    const isDeploy = interaction.commandName === DEPLOY
    const [repositories, mergeRequests] = await Promise.all([
        getRepositories(25, query),
        getOpenMergeRequests(INFRA_PROD_CLUSTER),
    ])
    const fallbackResult = focusedName === REPOSITORY
        ? `No repositories ${query.length > 0 ? `matching '${query}'` : ''} are ready for ${isDeploy ? 'deployment' : 'release'}.`
        : "You must enter a repository before entering the version."

    // Autocompletes repositories
    if (focusedName === REPOSITORY) {
        if (query.length) {
            for (const repo of repositories) {
                const name = repo.name.toLowerCase()
                if (isDeploy) {
                    if (name.includes(query)) {
                        relevant.push(repo)
                    }

                    continue
                }

                for (const mr of mergeRequests) {
                    const title = mr.title.toLowerCase()
                    if (name.includes(query) && title.includes(name)) {
                        relevant.push(repo)
                    }
                }
            }
        } else {
            if (isDeploy) {
                relevant = repositories
            } else {
                for (const repo of repositories) {
                    const name = repo.name.toLowerCase()
                    for (const mr of mergeRequests) {
                        if (mr.title.includes(name)) {
                            relevant.push(repo)
                        }
                    }
                }
            }
        }
    }

    // Autocompletes versions
    if (focusedName === VERSION) {
        if (!repository) { 
            // Repository must be decided before version, aborts.
        } else if (query.length) {
            for (const mr of mergeRequests) {
                const title = mr.title.toLowerCase()
                if (title.includes(query) && title.includes(repository)) {
                    relevant.push(mr)
                }
            }
        } else {
            for (const mr of mergeRequests) {
                const title = mr.title.toLowerCase()
                if (title.includes(repository)) {
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

    if (!relevant.length) {
        return await interaction.respond([{name: fallbackResult, value: fallbackResult}])
    }

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
