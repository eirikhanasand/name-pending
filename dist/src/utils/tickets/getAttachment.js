import config from "../config.js";
export default async function getAttachment(url) {
    try {
        const response = await fetch(`${config.api}/attachment/${url}`);
        if (!response.ok) {
            throw new Error(await response.json());
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(`Failed to fetch attachment "${url}". Reason: ${JSON.stringify(error)}`);
    }
}
