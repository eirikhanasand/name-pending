// Fetches the base64 encoded attachment from Discord
export default async function attachmentAsBase64(attachment) {
    try {
        const response = await fetch(attachment.url);
        if (!response.ok) {
            throw new Error(`Failed to fetch attachment from Discord: ${response.statusText}`);
        }
        // Creates a base64 string from the response array buffer
        const arrayBuffer = await response.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString('base64');
        return base64String;
    }
    catch (error) {
        console.error("Error uploading attachment:", error);
        return null;
    }
}
