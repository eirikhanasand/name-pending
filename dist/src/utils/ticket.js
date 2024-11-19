import config from "./config.js";
// Fetches all articles (messages) for a specific Zammad ticket
export default async function fetchTicket(id, recipient = false) {
    try {
        const response = await fetch(`${config.api}/ticket/${id}/${recipient}`, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        return error;
    }
}
export async function closeTicket(id, author) {
    const recipient = await fetchTicket(id, true);
    if (recipient) {
        try {
            const response = await fetch(`${config.api}/ticket/${id}/${author}/${recipient}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            return error;
        }
    }
}
