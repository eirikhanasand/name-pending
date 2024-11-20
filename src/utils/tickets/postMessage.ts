import { Message } from "discord.js"
import fetchTicket from "../ticket.js"
import attachmentAsBase64 from "./attachmentAsBase64.js"
import config from "../config.js"

export default async function postMessage(ticketID: number, message: Message, body: string | undefined = undefined) {
    const recipient = await fetchTicket(ticketID, true)

    if (recipient) {
        try {
            const attachments = []

            for (const att of message.attachments) {
                const attachment = att[1]
                const data = await attachmentAsBase64(attachment)

                if (data) {
                    attachments.push({ 
                        filename: attachment.name, 
                        data, 
                        "mime-type": attachment.contentType 
                    })
                }
            }

            const response = await fetch(`${config.api}/ticket/${ticketID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "group_id": 37,
                    "customer_id": 5567,
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
                throw new Error(`Failed to post message to zammad: ${await response.text()}`)
            }

            return response.status
        } catch (error) {
            console.log(error)
        }
    }
}
