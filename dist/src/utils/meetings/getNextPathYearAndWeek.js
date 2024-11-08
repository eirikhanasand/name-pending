export default function getNextPathYearAndWeek(isStyret) {
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
    let year = String(nextWednesdayDate.getFullYear());
    const date = `${day}.${month}.${isStyret ? year : year.slice(-2)}`;
    return {
        currentPath: isStyret ? `${currentWeek.year}-${currentWeek.week}` : '2024-00',
        nextPath: `${nextWeek.year}-${nextWeek.week}`,
        currentWeek: currentWeek.week,
        date
    };
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
