export default function generateDailyLinks(path: string) {
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

export function generateWeeklyLinks(path: string) {
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

export function generateYearlyLinks(path: string) {
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
