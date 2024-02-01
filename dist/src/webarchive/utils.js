import * as fs from 'fs';
import editEmbed from './embeds.js';
export default function remove(entries, id) {
    const index = entries.indexOf(id);
    if (index !== -1) {
        entries.splice(index, 1);
    }
}
/**
 * Fetches data from text files
 * Add a file param if expanding to multiple files
 */
export async function readFile(file) {
    return new Promise((res) => {
        fs.readFile(file, async (err, data) => {
            if (err)
                res(console.log("readFile.js", err));
            try {
                let content = JSON.parse(data.toString());
                res(content);
            }
            catch (e) {
                console.log("Error while reading from status.txt", e);
            }
        });
    });
}
/**
 * Writes data to text files.
 *
 * @param {string} fileName Filename to write to
 * @param {array} content Content to write to file
 */
export async function writeFile(content) {
    const file = "../../data/status.txt";
    const stringifiedContent = JSON.stringify(content);
    fs.writeFile(file, stringifiedContent, (err) => {
        if (err)
            console.log(err);
        console.log(`Overwrote ${file}. Cooldown: ${formatCooldown(content.cooldown)}, total archives: ${content.archives}.`);
    });
}
/**
 * Formats the cooldown to minutes and seconds
 * @param {*} cooldown Cooldown object
 * @returns {string} Formatted cooldown
 */
export function formatCooldown(storedCooldown) {
    const currentTime = new Date();
    currentTime.setHours(currentTime.getHours() + 2);
    const cooldownMillis = new Date(storedCooldown) - currentTime;
    if (cooldownMillis <= 0)
        return "Ready!";
    return formatMillis(cooldownMillis);
}
/**
 * Formats milliseconds into seconds and minute of format MM:SS
 * @param {number} millis Milliseconds
 * @returns {string} Formatted string
 */
export function formatMillis(millis) {
    const totalSeconds = Math.floor(millis / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60);
    return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
}
export function update(embed, stats) {
    const totalWeight = 4 * (stats.total_domains + stats.total_paths) + 200;
    const completedWeight = stats.domains_in_fetch_progress.length + (stats.finished_domains * 3) + stats.paths_in_fetch_progress + (stats.finished_paths * 3) + stats.links_generated;
    stats.progress = (completedWeight / totalWeight) * 100;
    // Ensure progress is between 0 and 100
    stats.progress = Math.trunc(Math.min(100, Math.max(0, stats.progress)));
    editEmbed(embed, stats);
}
/**
 * Function for returning the current time formatted as HH:MM, DD/MM, YEAR
 *
 * @returns {string} String
 */
export function currentTime() {
    const time = new Date();
    // Checking and fixing missing 0
    let day = time.getDate().toString().padStart(2, '0');
    let month = (time.getMonth() + 1).toString().padStart(2, '0');
    let year = time.getFullYear();
    let hour = time.getHours().toString().padStart(2, '0');
    let minute = time.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}, ${day}/${month}, ${year}`;
}
