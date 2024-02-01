import fetchURL from "./handleURL.js"

export default async function handlePaths(stats, website, websiteLinks) {
    const workingLinks = []
    await Promise.allSettled(websiteLinks.map(async(path) => {
        // Start stats
        stats.paths_in_progress++
        stats.paths_in_queue--
        stats.paths_in_fetch_progress++
        stats.paths_in_fetch_queue--
        // End stats

        let occursWeekly = /\/\d{4}-(0[1-9]|[1-4]\d|5[0-3])$/
        let occursYearly = /\/\d{4}$/
        let occursAtRandomDates = /\/\d{4}-\d{2}-\d{2}$/

        if (occursYearly.test(path)) {
            await Promise.allSettled(generateYearlyLinks(path).map(async(generatedPath) => {
                await handleGeneratedTest(website, generatedPath, stats, workingLinks)
            }))
            return
        }

        if (occursWeekly.test(path)) {
            await Promise.allSettled(generateWeeklyLinks(path).map(async(generatedPath) => {
                await handleGeneratedTest(website, generatedPath, stats, workingLinks)
            }))
            return
        }

        if (occursAtRandomDates.test(path)) {
            await Promise.allSettled(generateDailyLinks(path).map(async(generatedPath) => {
                await handleGeneratedTest(website, generatedPath, stats, workingLinks)
            }))
            return
        }

        let result = await fetchURL(website + "/" + path)
        if (result) workingLinks.push(result)
    }))

    return workingLinks
}

export async function handleGeneratedTest(website, generatedPath, stats, workingLinks) {
    // Start stats
    stats.links_generated++
    // End stats

    let link = website + "/" + generatedPath
    let result = await fetchURL(link, true)

    // Start stats
    if (!result) return stats.links_failed++
    // End stats
    workingLinks.push(result)
}

export function generateDailyLinks(path) {
    const links = []
    const today = new Date()
    const currentYear = today.getFullYear()

    for (let month = 1; month < 12; month++) {
        for (let day = 1; day < 31; day++) {
            links.push(`${path.slice(0, -10)}${currentYear}-${month < 10 ? "0" + month : month}-${day}`)
        }
    }

    return links
}

export function generateWeeklyLinks(path) {
    const currentWeek = getCurrentWeekNumber()
    const currentYear = new Date().getFullYear()
    const links = []

    for (let year = 2020; year <= currentYear; year++) {
        for (let week = 1; week <= currentWeek; week++) {
            links.push(`${path.slice(0, -7)}${year}-${week}`)
        }
    }

    return links
}

export function generateYearlyLinks(path) {
    const currentYear = new Date().getFullYear()
    const links = []

    for (let year = 2020; year <= currentYear; year++) {
        links.push(`${path.slice(0, -4)}${year}`)
    }

    return links
}

export function getCurrentWeekNumber() {
    // Get the current date
    const date = new Date()

    // January 1st of the current year
    const startOfYear = new Date(date.getFullYear(), 0, 1)

    // Calculate days passed
    const daysPassed = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000))

    // Calculate the week number
    const weekNumber = Math.ceil((daysPassed + startOfYear.getDay() + 1) / 7)

    return weekNumber
}