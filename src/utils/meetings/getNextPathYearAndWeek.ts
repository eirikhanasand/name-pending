export default  function getNextPathYearAndWeek(isStyret: boolean) {
    // Current date
    let currentDate = new Date()

    // Set to Monday (start of the week)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)

    // Calculate current week's year and week
    let currentWeek = getYearAndWeek(currentDate)

    // Move to next week's date
    let nextWeekDate = new Date(currentDate)
    nextWeekDate.setDate(nextWeekDate.getDate() + 7)

    // Calculate next week's year and week
    let nextWeek = getYearAndWeek(nextWeekDate)

    // Calculate next Wednesday based on nextWeekDate
    let nextWednesdayDate = new Date(nextWeekDate)
    let dayOfWeek = nextWednesdayDate.getDay()
    let daysUntilWednesday = (3 - dayOfWeek + 7) % 7
    nextWednesdayDate.setDate(nextWednesdayDate.getDate() + daysUntilWednesday)

    // Format nextWednesdayDate to dd.mm.yy
    let day = String(nextWednesdayDate.getDate()).padStart(2, '0')
    let month = String(nextWednesdayDate.getMonth() + 1).padStart(2, '0')
    let year = String(nextWednesdayDate.getFullYear())

    // Today
    let todaysDate = new Date()
    let todayDay = String(todaysDate.getDate()).padStart(2, '0')
    let todayMonth = String(todaysDate.getMonth() + 1).padStart(2, '0')
    let todayYear = String(todaysDate.getFullYear())
    
    const date = `${day}.${month}.${year.slice(-2)}`
    const today = `${todayDay}.${todayMonth}.${todayYear}`

    return {
        currentPath: isStyret ? `${currentWeek.year}-${currentWeek.week - 1}` : '2024-00',
        nextPath: `${nextWeek.year}-${isStyret ? nextWeek.week - 1 : nextWeek.week}`,
        currentWeek: currentWeek.week,
        date: isStyret ? today : date
    }
}

function getYearAndWeek(date: Date) {
    // Copy the date to avoid modifying the original
    let d = new Date(date.getTime())

    // Move date to the nearest Thursday (ISO week date system)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)

    // Get the first day of the year
    let firstThursday = new Date(d.getFullYear(), 0, 4)
    firstThursday.setDate(firstThursday.getDate() - (firstThursday.getDay() + 6) % 7)

    // Calculate week number
    let weekNumber = Math.ceil(((d.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7)

    return { 
        year: d.getFullYear(), 
        week: weekNumber 
    }
}
