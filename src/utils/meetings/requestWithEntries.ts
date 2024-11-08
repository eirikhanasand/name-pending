import dotenv from 'dotenv'

type RequestWithRetriesProps = {
    query: string
    retries?: number
    delay?: number
}

dotenv.config()

const { GRAPHQL_URL, WIKIJS_TOKEN } = process.env

if (!GRAPHQL_URL || !WIKIJS_TOKEN) {
    throw new Error('Missing essential environment variables in wiki.ts')
}

// Function to perform a GraphQL request with retries
export default async function requestWithRetries({query, retries = 10, delay = 1000}: RequestWithRetriesProps) {
    while (retries > 0) {
        try {
            const response = await fetch(GRAPHQL_URL as string, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${WIKIJS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            })

            if (!response.ok) {
                throw new Error(await response.json())
            }

            const data = await response.json()
            return data
        } catch (error: any) {
            console.log(error)
            if (error.response && error.response.status === 401) {
                // Retry on authentication errors
                retries--
                if (retries === 0) {
                        throw new Error('Exceeded maximum retries for authentication errors')
                }
            } else {
                // Logs full stack trace
                // logStack(error)
            }
            await new Promise(resolve => setTimeout(resolve, delay))
            // Exponential backoff
            delay *= 2
        }
    }
}