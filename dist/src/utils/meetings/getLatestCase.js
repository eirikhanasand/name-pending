import dotenv from 'dotenv';
dotenv.config();
const { WIKI_URL } = process.env;
if (!WIKI_URL) {
    throw new Error('Missing WIKI_URL in getLatestCase.ts');
}
export default async function getLatestCase(list) {
    const urls = extractUrls(list.content);
    for (const url of urls) {
        try {
            const response = await fetch(`${WIKI_URL}${url}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}. Reason: ${await response.text()}`);
            }
            const data = await response.text();
            const foundCases = caseNumbers(data);
            if (foundCases.length) {
                return Number(foundCases[foundCases.length - 1]);
            }
        }
        catch (error) {
            continue;
        }
    }
    return 0;
}
// Extract URLs from the content
function extractUrls(content) {
    const urlPattern = /-\s\[\d{4}-\d{2}\s-\sStyremøte]\((\/public\/docs\/minutes\/styremoter\/\d{4}-\d{2})\)/g;
    const matches = [];
    let match;
    while ((match = urlPattern.exec(content)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}
// Extracts the case numbers from the fetched document
function caseNumbers(content) {
    const regex = /\b[ODVE] - 24 - Sak: (\d+)\b/g;
    const matches = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1]);
    }
    return matches;
}
