import requestWithRetries from "./requestWithEntries.js"

type CreatePageProps = {
    content: string
    description: string
    path: string
    title: string
}

export default async function createPage({content, description, path, title}: CreatePageProps) {
    const mutation = `
    mutation Page {
        pages {
            create (content: """${content}""", description: "${description}", editor: "markdown", isPublished: true, isPrivate: false, locale: "en", path: "${path}", tags: "[]", title: "${title}") {
                responseResult {
                    succeeded,
                    errorCode,
                    slug,
                    message
                },
                page {
                    id,
                    path,
                    title
                }
            }
        }
    }
    `

    const result = await requestWithRetries({ query: mutation })
    return result
}
