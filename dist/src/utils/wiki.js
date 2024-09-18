import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const { TEKKOM_MEETINGS_URL, STYRET_MEETINGS_URL, DISCORD_TEKKOM_ROLE_ID, GRAPHQL_URL, WIKIJS_TOKEN } = process.env;
if (!TEKKOM_MEETINGS_URL
    || !DISCORD_TEKKOM_ROLE_ID
    || !STYRET_MEETINGS_URL
    || !GRAPHQL_URL
    || !WIKIJS_TOKEN) {
    throw new Error('Missing essential environment variables in wiki.ts');
}
function getQuery(id) {
    return `
    query {
        pages {
            single(id: ${id}) {
                path
                title
                content
                description
            }
        }
    }
    `;
}
// Define the mutation to update the page content
const updateMutation = ({ id, content, description, title }) => `
    mutation Page {
        pages {
            update (
                id: ${id}, 
                content: """${content}""", 
                description: "${description}", 
                title: "${title}", 
                editor: "code", 
                isPublished: true, 
                isPrivate: false, 
                locale: "en", 
                tags: ""
            ) {
                responseResult {
                    succeeded,
                    errorCode,
                    slug,
                    message
                },
                page {
                    id,
                    content,
                    description,
                    title
                }
            }
        }
    }
`;
// Function to update the page content
function modifyPage({ existingHTML, path, isStyret }) {
    const paths = [TEKKOM_MEETINGS_URL, STYRET_MEETINGS_URL];
    const newEntry = `- [${path.nextPath}${isStyret ? ' - Styremøte' : ''}](${paths[isStyret ? 1 : 0]}${path.nextPath})`;
    // Regex for both styret and tekkom formats
    const styretRegex = /(- \[\d{4}-\d{2} - Styremøte\]\(\/public\/docs\/minutes\/styremoter\/\d{4}-\d{2}\))/;
    const tekkomRegex = /(- \[\d{4}-\d{2}\]\(\/tekkom\/meetings\/\d{4}-\d{2}\))/;
    // Choose the appropriate regex based on isStyret
    const regex = isStyret ? styretRegex : tekkomRegex;
    // Checks if the entry already exists
    if (existingHTML.includes(newEntry)) {
        return existingHTML;
    }
    // Find the first match to insert the new entry before it
    const firstMatch = existingHTML.match(regex);
    if (firstMatch) {
        const insertIndex = firstMatch.index;
        const updatedHTML = existingHTML.slice(0, insertIndex) + newEntry + "\n" + existingHTML.slice(insertIndex);
        return updatedHTML;
    }
    // Determine the section header to insert into
    const styretString = '### Styremøter';
    const tekkomString = '### Minutes';
    const insertionPoint = existingHTML.indexOf(isStyret ? styretString : tekkomString);
    // Calculate the index to insert the new entry
    const index = insertionPoint + (isStyret ? styretString.length : tekkomString.length);
    // If no match is found, insert at the start of the correct section
    const updatedHTML = existingHTML.slice(0, index) + "\n" + newEntry + "\n" + existingHTML.slice(index);
    return updatedHTML;
}
// Fetches the page, adds the new document, and writes it back
async function updateIndex({ path, query }) {
    try {
        const fetchResponse = await requestWithRetries({ query });
        console.log('Fetch success', fetchResponse);
        const content = fetchResponse.data.pages.single.content;
        const updatedContent = modifyPage({ existingHTML: content, path, isStyret: content.includes('styremoter') });
        const TekKomTitle = 'Meetings';
        const TekKomDescription = 'TekKom meeting agendas and minutes. This page is automatically managed. Please edit with care. Report errors to TekKom.';
        const updateResponse = await requestWithRetries({ query: updateMutation({
                id: 37,
                content: updatedContent,
                description: TekKomDescription,
                title: TekKomTitle
            }) });
        console.log('Update success', updateResponse);
    }
    catch (error) {
        // Logs full stack trace
        // logStack(error)
    }
}
// Function to perform a GraphQL request with retries
async function requestWithRetries({ query, retries = 10, delay = 1000 }) {
    while (retries > 0) {
        try {
            const response = await axios.post(GRAPHQL_URL, { query }, {
                headers: {
                    'Authorization': `Bearer ${WIKIJS_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            if (error.response && error.response.status === 401) {
                // Retry on authentication errors
                retries--;
                if (retries === 0) {
                    throw new Error('Exceeded maximum retries for authentication errors');
                }
            }
            else {
                // Logs full stack trace
                // logStack(error)
            }
            await new Promise(resolve => setTimeout(resolve, delay));
            // Exponential backoff
            delay *= 2;
        }
    }
}
async function createPage({ content, description, path, title }) {
    const mutation = `
    mutation Page {
        pages {
            create (content: """${content}""", description: "${description}", editor: "markdown", isPublished: true, isPrivate: false, locale: "en", path: "${path}", tags: "[]", title: "${title}") {
                responseResult {
                    succeeded,
                    errorCode,
                    slug,
                    message
                },
                page {
                    id,
                    path,
                    title
                }
            }
        }
    }
    `;
    const result = await requestWithRetries({ query: mutation });
    return result;
}
function logStack(error) {
    if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
    }
    else if (error.request) {
        // Request was made but no response received
        console.error('Request data:', error.request);
    }
    else {
        // Something else went wrong
        console.error('Error message:', error.message);
    }
}
function getYearAndWeek(date) {
    // Copy the date to avoid modifying the original
    let d = new Date(date.getTime());
    // Move date to the nearest Thursday (ISO week date system)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    // Get the first day of the year
    let firstThursday = new Date(d.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7);
    // Calculate week number
    let weekNumber = Math.ceil(((d.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7);
    return {
        year: d.getFullYear(),
        week: weekNumber
    };
}
export function getNextWeekYearAndWeek(isStyret) {
    // Current date
    let currentDate = new Date();
    // Set to Monday (start of the week)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1);
    // Calculate current week's year and week
    let currentWeek = getYearAndWeek(currentDate);
    // Move to next week's date
    let nextWeekDate = new Date(currentDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    // Calculate next week's year and week
    let nextWeek = getYearAndWeek(nextWeekDate);
    // Calculate next Wednesday based on nextWeekDate
    let nextWednesdayDate = new Date(nextWeekDate);
    let dayOfWeek = nextWednesdayDate.getDay();
    let daysUntilWednesday = (3 - dayOfWeek + 7) % 7;
    nextWednesdayDate.setDate(nextWednesdayDate.getDate() + daysUntilWednesday);
    // Format nextWednesdayDate to dd.mm.yy
    let day = String(nextWednesdayDate.getDate()).padStart(2, '0');
    let month = String(nextWednesdayDate.getMonth() + 1).padStart(2, '0');
    let yearShort = String(nextWednesdayDate.getFullYear()).slice(-2);
    let tekkomDate = `${day}.${month}.${yearShort}`;
    return {
        currentPath: isStyret ? `${currentWeek.year}-${currentWeek.week}` : '2024-00',
        nextPath: `${nextWeek.year}-${nextWeek.week}`,
        currentWeek: currentWeek.week,
        tekkomDate: tekkomDate
    };
}
export default async function autoCreate({ channel, isStyret }) {
    const path = getNextWeekYearAndWeek(isStyret);
    const query = getQuery(isStyret ? 556 : 556);
    const fetchResponse = await requestWithRetries({ query });
    const content = fetchResponse.data.pages.single.content;
    const filledTemplate = content
        .replace(new RegExp(`${path.currentPath}`, 'g'), path.nextPath)
        .replace('00.00.00', path.tekkomDate);
    const fullPath = isStyret
        ? `${STYRET_MEETINGS_URL}${path.nextPath}`
        : `${TEKKOM_MEETINGS_URL}${path.nextPath}`;
    const createResponse = await createPage({
        content: filledTemplate,
        description: '',
        path: fullPath,
        title: path.nextPath
    });
    // @ts-ignore (hardcoded channel, expected to be of correct type)
    channel.send(`<@&${DISCORD_TEKKOM_ROLE_ID}> Minner om TekKom møte på onsdag kl 16 på LL. [Agenda](https://wiki.login.no/tekkom/meetings/${path.nextPath})`, createResponse);
    updateIndex({ path, query: getQuery(isStyret ? 7 : 37) });
}
