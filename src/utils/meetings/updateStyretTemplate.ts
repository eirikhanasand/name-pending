import { Message, TextChannel } from "discord.js"
import getQuery from "./getQuery.js"
import requestWithRetries from "./requestWithEntries.js"
import getLatestCase from "./getLatestCase.js"

type StyretTemplateProps = {
    channel: TextChannel
    isStyret: boolean
    template: string
    week: string
}

type MessageOverview = {
    orientations: string[]
    discussions: string[]
    statutes: string[]
}

type GetContentProps = {
    type: 'O' | 'D' | 'V'
    message: Message
    week: string
}

// Fills in the styret template with the relevant points.
export default async function updateStyretTemplate({channel, isStyret, template, week}: StyretTemplateProps): Promise<string> {
    if (!isStyret) {
        return template
    }

    const threads = channel.threads.cache
    let meetingNextWeek = false
    let meetingThread = null

    for (const thread of threads) {
        if (thread[1].name.includes(week)) {
            meetingNextWeek = true
            meetingThread = thread
        }
    }
    
    if (!meetingNextWeek || !meetingThread) {
        return ''
    }

    // Finds the latest case number
    const query = getQuery(7)
    const fetchResponse = await requestWithRetries({ query })
    let caseNumber = await getLatestCase(fetchResponse.data.pages.single) + 1
    const messages = await meetingThread[1].messages.fetch({ limit: 100 })
    const reduced: MessageOverview = messages.reduce((acc: MessageOverview, message) => {
        // Checks that the message is relevant (O / D / V)
        if (message.content.startsWith("O - ")) {
            acc.orientations.push(getContent({type: 'O', message, week}))
        }

        if (message.content.startsWith("D - ")) {
            acc.discussions.push(getContent({type: 'D', message, week}))
        }

        if (message.content.startsWith("V - ")) {
            acc.statutes.push(getContent({type: 'V', message, week}))
        }

        return acc
    }, {
        orientations: [],
        discussions: [],
        statutes: []
    })

    reduced.orientations = reduced.orientations.map((message) =>
        message = message.replace(`### O - ${week} - Sak: 000`, `### O - ${week} - Sak: ${caseNumber++}`)
    )
    
    reduced.discussions = reduced.discussions.map((message) =>
        message = message.replace(`### D - ${week} - Sak: 000`, `### D - ${week} - Sak: ${caseNumber++}`)
    )

    reduced.statutes = reduced.statutes.map((message) =>
        message = message.replace(`### V - ${week} - Sak: 000`, `### V - ${week} - Sak: ${caseNumber++}`)
    )

    const u1 = template.replace(/### O - 00 - Sak: 000 - Tittel - Saksansvarlig: Rolle/, reduced.orientations.length ? reduced.orientations.join('\n') : 'Ingen orienteringer.')
    const u2 = u1.replace(/### D - 00 - Sak: 000 - Tittel - Saksansvarlig: Rolle/, reduced.discussions.length ? reduced.discussions.join('\n') : 'Ingen diskusjonssaker.')
    const res = u2.replace(/### V - 00 - Sak: 000 - Tittel - Saksansvarlig: Rolle/, reduced.statutes.length ? reduced.statutes.join('\n') : 'Ingen vedteker.')
    return res
    // create orientations string
    // create discussions string
    // create statutes string
    // console.log(template)
    // hent discord saker
    // sorter etter orientering, diskusjon og vedtekt
    // fyll inn i template
    // send oppdatert template
}

function getContent({type, message, week}: GetContentProps) {
    const content = message.content.split('\n')
    const background = content[1]?.trim().length ? `Bakgrunn:\n${content[1]}` : ''

    return `### ${type} - ${week} - Sak: 000 - ${content[0].slice(3)} - Saksansvarlig: ${message.member?.displayName || message.author.username}\n${background}\n\n- ***Notater:***\n<br>`
}
