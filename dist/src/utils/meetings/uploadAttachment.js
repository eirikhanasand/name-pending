import path from 'path';
import dotenv from 'dotenv';
dotenv.config();
const { WIKIJS_TOKEN, WIKI_URL } = process.env;
if (!WIKIJS_TOKEN || !WIKI_URL) {
    throw new Error('Missing WIKIJS_TOKEN in uploadAttachment.ts');
}
export default async function uploadAttachmentToWiki({ attachment, week }) {
    try {
        const response = await fetch(attachment);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const baseName = path.basename(attachment);
        const name = `${week}_${uuid(8)}_${baseName.split('?')[0]}`;
        const form = new FormData();
        form.append('mediaUpload', new Blob([buffer]), name);
        form.append('mediaUpload', '{"folderId":0}');
        const uploadResponse = await fetch(`${WIKI_URL}/u`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WIKIJS_TOKEN}`
            },
            body: form
        });
        if (!uploadResponse.ok) {
            throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
        }
        const data = await uploadResponse.text();
        if (data !== "ok") {
            return `Failed to upload file ${baseName}`;
        }
        return name.toLowerCase();
    }
    catch (error) {
        console.error('Error uploading attachment:', error);
    }
}
function uuid(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    let result = '';
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter++;
    }
    return result;
}
