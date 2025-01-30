import { Message, TextChannel } from "discord.js"
import getQuery from "./getQuery.js"
import requestWithRetries from "./requestWithEntries.js"
import getLatestCase from "./getLatestCase.js"
import uploadAttachmentToWiki from "./uploadAttachment.js"

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
    year: string
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
    const reduced: MessageOverview = { orientations: [], discussions: [], statutes: [] }
    const year = new Date().getFullYear().toString().slice(2)

    for (const [_, message] of messages) {
        // Checks that the message is relevant (O / D / V)
        if (message.content.startsWith("O - ")) {
            reduced.orientations.push(await getContent({type: 'O', message, week, year }))
        }
        
        if (message.content.startsWith("D - ")) {
            reduced.discussions.push(await getContent({type: 'D', message, week, year }))
        }
        
        if (message.content.startsWith("V - ")) {
            reduced.statutes.push(await getContent({type: 'V', message, week, year }))
        }
    }

    reduced.orientations = reduced.orientations.map((message) =>
        message = message.replace(`### O - ${year} - Sak: 000`, `### O - ${year} - Sak: ${caseNumber++}`)
    )
    
    reduced.discussions = reduced.discussions.map((message) =>
        message = message.replace(`### D - ${year} - Sak: 000`, `### D - ${year} - Sak: ${caseNumber++}`)
    )

    reduced.statutes = reduced.statutes.map((message) =>
        message = message.replace(`### V - ${year} - Sak: 000`, `### V - ${year} - Sak: ${caseNumber++}`)
    )

    const u1 = template.replace(/### O - 00 - Sak: 000 - Tittel - Saksansvarlig: Rolle/, 
        reduced.orientations.length ? reduced.orientations.join('\n') : 'Ingen orienteringer.')
    const u2 = u1.replace(/### D - 00 - Sak: 000 - Tittel - Saksansvarlig: Rolle/, 
        reduced.discussions.length ? reduced.discussions.join('\n') : 'Ingen diskusjonssaker.')
    const res = u2.replace(/### V - 00 - Sak: 000 - Tittel - Saksansvarlig: Rolle/, 
        reduced.statutes.length ? reduced.statutes.join('\n') : 'Ingen vedteker.')
    
    return res
}

async function getContent({type, message, week, year}: GetContentProps) {
    const content = message.content.split('\n')
    const background = content.length && content.slice(1).join('\n')?.trim().length ? `Bakgrunn:\n${content.slice(1).join('\n')}` : ''
    const attachments = message.attachments.map((attachment) => attachment.url)
    const uploadedAttachments = []

    for (const attachment of attachments) {
        const result = await uploadAttachmentToWiki({attachment, week})
        
        if (result?.startsWith(week)) {
            const isImage = result.includes('.png') || result.includes('.jpg') || result.includes('.jpeg') || result.includes('.gif')
            uploadedAttachments.push(`${isImage ? '!' : ''}[${result.split('_')[2]}](/${result})`)
        }
    }

    const assets = uploadedAttachments.length > 0 ? `\nVedlegg:\n${uploadedAttachments.join('\n')}\n` : ''

    return `### ${type} - ${year} - Sak: 000 - ${content[0].slice(3)} - Saksansvarlig: ${message.member?.displayName || message.author.username}\n${background}\n${assets}\n- ***Notater:***\n${type === 'V' ? '- ***Vedtatt / Ikke vedtatt:***\n' : ''}<br>`
}
