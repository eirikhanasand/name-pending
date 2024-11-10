import { Message } from "discord.js"
import { API } from "../../../constants.js"
import fetchTicket from "../ticket.js"
import uploadAttachmentToZammad from "./uploadAttachmentToZammad.js"

export default async function postMessage(ticketID: number, message: Message, body: string | undefined = undefined) {
    const recipient = await fetchTicket(ticketID, true)

    if (recipient) {
        try {
            const attachments = []

            for (const attachment of message.attachments) {
                const data = await uploadAttachmentToZammad(attachment[1])

                if (data) {
                    attachments.push({ 
                        filename: attachment[1].name, 
                        data, 
                        "mime-type": attachment[1].contentType 
                    })
                }
            }

            const response = await fetch(`${API}/ticket/${ticketID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "group_id": 37,
                    "customer_id": 3116,
                    "article": {
                        "body": body || `From ${message.author.username} via Discord:\n\n${message.content}`,
                        "type": "email",
                        "internal": false,
                        "to": recipient,
                        attachments
                    }
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
