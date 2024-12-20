import { DISCORD_MAX_INLINE_EMBED_FILED_LENGTH } from "../../../constants.js"

export default function formatCommits(commits: Commit[], count: number) {
    let authors = ""
    let descriptions = ""

    let i = 0
    while (commits && i < count) {
        authors += `${commits[i].short_id}, ${commits[i].author_name}\n`
        const created = new Date(commits[i].created_at)
        const year = String(created.getFullYear()).slice(2).toString().padStart(2, '0')
        const day = created.getDate().toString().padStart(2, '0')
        const month = (created.getMonth() + 1).toString().padStart(2, '0')
        const hour = created.getHours().toString().padStart(2, '0')
        const minute = created.getMinutes().toString().padStart(2, '0')
        const localeString = created.toLocaleString()
        const meridian = localeString.slice(localeString.length - 2, localeString.length)
        const formatDate = `${day}.${month}.${year}, ${hour}:${minute} ${meridian}`
        const description = `${formatDate}, ${commits[i].title}`
        descriptions += `${description.slice(0, DISCORD_MAX_INLINE_EMBED_FILED_LENGTH).trim()}${description.length > DISCORD_MAX_INLINE_EMBED_FILED_LENGTH ? '…' : ''}\n`
        i++
    }

    return [
        {name: "Commit\tAuthor", value: authors, inline: true},
        {name: "Info", value: descriptions, inline: true}
    ]
}
