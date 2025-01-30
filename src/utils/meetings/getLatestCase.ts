import dotenv from 'dotenv'

dotenv.config()

const { WIKI_URL } = process.env

if (!WIKI_URL) {
    throw new Error('Missing WIKI_URL in getLatestCase.ts')
}

type Page = {
    path: string
    title: string
    content: string
    description: string
}

export default async function getLatestCase(list: Page) {
    const urls = extractUrls(list.content)

    for (const url of urls) {
        try {
            const response = await fetch(`${WIKI_URL}${url}`)
    
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}. Reason: ${await response.text()}`)
            }
    
            const data = await response.text()
            const foundCases = caseNumbers(data)

            if (foundCases.length) {
                return Number(foundCases[foundCases.length - 1])
            }
        } catch (error) {
            continue
        }
    }

    return 0
}

// Extract URLs from the content
function extractUrls(content: string) {
    const urlPattern = /-\s\[\d{4}-\d+\s-\sStyremøte]\((\/public\/docs\/minutes\/styremoter\/\d{4}-\d+)\)/g
    const matches = []
    let match

    while ((match = urlPattern.exec(content)) !== null) {
        matches.push(match[1])
    }

    return matches
}

// Extracts the case numbers from the fetched document
function caseNumbers(content: string) {
    const regex = /\w - \d+ - Sak: (\d+)/g
    const matches = []
    let match

    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1])
    }

    return matches
}
