import { ZAMMAD_API, ZAMMAD_TOKEN } from "../../constants.js"

// Fetches all articles (messages) for a specific Zammad ticket
export default async function fetchTicket(id: number, recipient: boolean = false) {
    try {
        const response = await fetch(`${ZAMMAD_API}/ticket_articles/by_ticket/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token token=${ZAMMAD_TOKEN}`
            }
        })
    
        if (!response.ok) {
            const data = await response.json()
            throw new Error(data)
        }
    
        const data = await response.json()

        if (recipient) {
            return data[0]?.to
        }

        return data.reduce((acc: any, ticket: Ticket) => {
            if (!ticket.internal) {
                acc.push({ user: ticket.from, content: ticket.body })
            }

            return acc
        }, [])
    } catch (error) {
        console.log(`Error fetching zammad messages for ticket ${id}. Error: ${error}`)
        return error
    }
}
