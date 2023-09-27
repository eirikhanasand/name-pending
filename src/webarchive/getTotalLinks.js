import url from '../../data/links.json' assert { type: 'json' };
const websites = url.websites
const websiteLinks = url.websiteLinks

export default function getTotalLinks() {
    const shared = {
        domains: getTotalDomains(),
        paths: getTotalPaths()
    }

    const info = {
        total: shared.domains + shared.paths,
        domains: shared.domains,
        paths: shared.paths
    }

    return info
}

export function getTotalDomains() {
    return websites.length
}

export function getTotalPaths() {
    let count = 0
    
    for (let i = 0; i < websites.length; i++) {
        if (websiteLinks[websites[i]] != undefined) {
            for (let j = 0; j < websiteLinks[websites[i]].length; j++) {
                count++
            }
        }
    }
    
    return count;
}