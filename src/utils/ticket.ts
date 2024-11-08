import { API } from "../../constants.js"

// Fetches all articles (messages) for a specific Zammad ticket
export default async function fetchTicket(id: number, recipient: boolean = false) {
    try {
        const response = await fetch(`${API}/ticket/${id}/${recipient}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        })
    
        if (!response.ok) {
            const data = await response.json()
            throw new Error(data)
        }
    
        const data = await response.json()
        return data
    } catch (error) {
        return error
    }
}

export async function closeTicket(id: number, author: string) {
    const recipient = await fetchTicket(id, true)

    if (recipient) {
        try {
            const response = await fetch(`${API}/ticket/${id}/${author}/${recipient}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
        
            if (!response.ok) {
                const data = await response.json()
                throw new Error(data)
            }
        
            const data = await response.json()
            return data
        } catch (error) {
            return error
        }
    }
}
