import url from '../../data/links.json' assert { type: 'json' };
import handlePaths from './handlePaths.js'
import remove from './utils.js';
import editEmbed from './embeds.js';
const websites = url.websites
const websiteLinks = url.websiteLinks

/**
 * Extensive fetch function
 * 
 * The function returns on success, continues on error. This means fast on 
 * success, slow on failure. Therefore the boolean fast param is provided if 
 * speed is critical.
 * 
 * Breakdown:
 * Fetches HTTPS HEAD because its the fastest.
 * Fetches HTTPS GET because sometimes HEAD is refused.
 * Fetches HTTP HEAD in case of missing certificate.
 * Fetches HTTP GET in case of missing certificate and HEAD refused.
 * Terminates if there has not been a reply yet.
 * Returns the link to archive the error page.
 * Catches any unhandled errors and logs their error code.
 * 
 * @param {string} link Link to fetch
 * @param {boolean} generated Terminates not found generated webpages to avoid fetching the 404 page multiple times.
 * @param {boolean} fast Provides a faster way to run the function by terminating early
 * @returns link | nothing
 */
export default async function fetchURL(link, generated, fast) {
    try {
        let response = await fetch(link, {method: 'HEAD'});
        if (!response) console.log("No secure HEAD reply from " + link)
        if (response.status === 200) return link
        if (fast) return
        response = await fetch(link, {method: 'GET'});
        if (!response) console.log("No secure GET reply from " + link)
        if (response.status === 200) return link
        response = await fetch(link.replace('https://', 'http://'), {method: 'HEAD'})
        if (!response) console.log(`No insecure HEAD reply from ${link}`)
        if (response.status === 200) return link
        response = await fetch(link.replace('https://', 'http://'), {method: 'GET'})
        if (!response) console.log(`No insecure GET reply from ${link}`)
        if (response.status === 200) return link
        if (!response) return console.log(`No reply from ${link}`)
        if (generated) return
        if (response.status) return link // Returning on error to archive error pages
    } catch (e) {
        if (e.cause.code) {
            switch (e.cause.code) {
                case 'ERR_TLS_CERT_ALTNAME_INVALID':    return console.log(`Invalid certificate ${link}`)
                case 'ECONNREFUSED':                    return console.log(`Connection refused ${link}`)
                case 'ETIMEDOUT':                       return console.log(`Timed out ${link}`)
                default:                                return console.log(`Unhandled error ${e.cause.code} for ${link}`)
            }
        }
        return console.log(`Unhandled error ${e} for ${link}`)}
}

export async function archiveURLs(embed, stats) {
    // Start stats
    stats.domains_in_queue = websites
    stats.domains_in_fetch_queue = websites
    stats.paths_in_queue = stats.total_paths
    stats.paths_in_fetch_queue = stats.total_paths
    editEmbed(embed, stats)
    // End stats

    let workingURLs = []
    await Promise.allSettled(websites.map(async(website) => {
        // Start stats
        stats.domains_in_progress.push(website)
        remove(stats.domains_in_queue, website)
        stats.domains_in_fetch_progress.push(website)
        editEmbed(embed, stats)
        // End stats

        try {
            const response = await fetchURL(website)
            if (!response) {
                // Start stats
                stats.domains_failed++
                stats.links_failed++
                remove(stats.domains_in_progress, website)
                remove(stats.domains_in_fetch_progress, website)
                // End stats

                return console.log(`Unable to fetch ${prettifyURL(website)}.`)
            }

            workingURLs.push(website)
            if (!websiteLinks[website] || !websiteLinks[website].length) {
                // Start stats
                stats.domains_in_archive_queue.push(website)
                stats.domains_in_queue.push(website)
                // End stats

                return console.log(`Successfully fetched ${prettifyURL(website)}. No subpaths found, continuing.`)
            }

            console.log(`Fetching ${websiteLinks[website].length} subpaths for ${website}...`)
            const paths = await handlePaths(stats, website, websiteLinks[website])

            paths.forEach((path) => {
                // Start stats
                stats.paths_in_progress--
                stats.paths_in_fetch_progress--
                stats.paths_in_archive_queue.push(path)
                stats.paths_in_queue++
                // End stats

                workingURLs.push(path)
            })

            // Start stats
            stats.domains_in_archive_queue.push(website)
            stats.domains_in_queue.push(website)
            remove(stats.domains_in_progress, website)
            remove(stats.domains_in_fetch_progress, website)
            // End stats
            
        } catch (e) {
            // Start stats
            stats.domains_failed++
            remove(stats.domains_in_progress, website)
            remove(stats.domains_in_fetch_progress, website)
            // End stats

            if (e.cause) {
                switch (e.cause.code) {
                    case 'ENOTFOUND': return console.log(`${prettifyURL(website)} not found.`)
                    case 'UND_ERR_CONNECT_TIMEOUT': return console.log(`${prettifyURL(website)} is not responding.`)
                    case 'ECONNREFUSED': return console.log(`${prettifyURL(website)} refuses connection.`)
                    case 'ERR_TLS_CERT_ALTNAME_INVALID': return console.log(website, "has invalid certificate.")
                    default: return console.log(`Unknown error: ${e.cause.code}`)
                }
            } else console.log("else", e)
        }
        console.log(`Finished fetching ${prettifyURL(website)}`)
    }))

    for (const item of workingURLs) {
        console.log(item);
    }
    console.log("Recieved", workingURLs.length)
    await archiveWorkingURLs(embed, workingURLs, stats)
}

export function prettifyURL(url) {
    const isHttps = /^https:\/\//.test(url);
    if (isHttps) return url.slice(8)
    return url.slice(7)
}

export function isDomain(url) {
    const regex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})(\/)?$/;
    return regex.test(url);
}

export async function archiveWorkingURLs(embed, links, stats) {
    stats.status = "Archiving"
    editEmbed(embed, stats)
    const archiveURL = "https://web.archive.org/save/"

    if (!links || !links.length) {
        // Start stats
        stats.domains_failed = stats.total_domains
        stats.links_failed = stats.total_paths + stats.links_generated
        stats.finished_domains = 0
        stats.finished_paths = 0
        stats.paths_in_archive_progress = []
        stats.paths_in_archive_queue = []
        stats.domains_in_archive_progress = []
        stats.domains_in_archive_queue = []
        stats.domains_in_progress = []
        stats.domains_in_queue = []
        stats.paths_in_progress = 0
        stats.paths_in_queue = 0
        stats.domains_in_fetch_progress = []
        stats.domains_in_fetch_queue = []
        stats.paths_in_fetch_progress = 0
        stats.paths_in_fetch_queue = 0
        stats.status = "Finished"
        editEmbed(embed, stats)
        // End stats

        return console.log("Archive recieved no working links.")
    }

    await Promise.allSettled(links.map(async(url) => {
        // Start stats
        const domain = isDomain(url)
        if (domain) {
            stats.domains_in_archive_progress.push(url)
            remove(stats.domains_in_archive_queue, url)
            stats.domains_in_progress.push(url)
            remove(stats.domains_in_queue, url)
        } else {
            stats.paths_in_archive_progress.push(url)
            remove(stats.paths_in_archive_queue, url)
            stats.paths_in_progress++
            stats.paths_in_queue--
        }
        // End stats

        const response = await fetchURL(archiveURL + url)

        if (response) {
            if (domain) stats.finished_domains++
            else stats.finished_paths++
        } else {
            if (domain) stats.domains_failed++
            else stats.links_failed++
        }

        if (domain) {
            remove(stats.domains_in_archive_progress, url)
            remove(stats.domains_in_progress, url)
        } else {
            remove(stats.paths_in_archive_progress, url)
            stats.paths_in_progress--
        }
        editEmbed(embed, stats)
    }))
}