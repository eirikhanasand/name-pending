export default function formatCommits(commits: Commit[], count: number) {
    let authors = ""
    let descriptions = ""

    let i = 0
    while (commits && i < count) {
        authors += `${commits[i].short_id}, ${commits[i].author_name}\n`
        const created = new Date(commits[i].created_at)
        const year = String(created.getFullYear()).slice(2)
        const day = created.getDate()
        const month = created.getMonth() + 1
        const hour = created.getHours()
        const minute = created.getMinutes()
        const localeString = created.toLocaleString()
        const meridian = localeString.slice(localeString.length - 2, localeString.length)
        const formatDate = `${day}.${month}.${year}, ${hour}:${minute} ${meridian}`
        const description = `${formatDate}, ${commits[i].title}`
        descriptions += `${description.slice(0, 42).trim()}${description.length > 42 ? '…' : ''}\n`
        i++
    }

    return [
        {name: "Commit\tAuthor", value: authors, inline: true},
        {name: "Info", value: descriptions, inline: true}
    ]
}
