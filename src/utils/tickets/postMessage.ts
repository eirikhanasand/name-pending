import { Message } from "discord.js"
import { ZAMMAD_API, ZAMMAD_TOKEN } from "../../../constants.js"
import fetchTicket from "../fetchTicket.js"

export default async function postMessage(ticketID: number, message: Message, body: string | undefined = undefined) {
    const recipient = await fetchTicket(ticketID, true)

    if (recipient) {
        try {
            const response = await fetch(`${ZAMMAD_API}/tickets/${ticketID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token token=${ZAMMAD_TOKEN}`
                },
                body: JSON.stringify({
                    "group_id": 37,
                    "customer_id": 3116,
                    "article": {
                        "body": body || `From ${message.author.username} via Discord:\n\n${message.content}`,
                        "type": "email",
                        "internal": false,
                        "to": recipient
                    },
                    "priority_id": 2,
                    "due_at": "2024-09-30T12:00:00Z"
                })
            })
        
            if (!response.ok) {
                throw new Error(`Failed to post message to zammad: ${JSON.stringify(await response.json())}`)
            }
        
            return response.status
        } catch (error) {
            console.log(error)
        }
    }
}
