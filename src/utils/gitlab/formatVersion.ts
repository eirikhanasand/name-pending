export default function formatVersion(text: string): number[] {
    const regex = /\bv?(\d+)(?:\.(\d+))?(?:\.(\d+))?\b/g
    const matches = [...text.matchAll(regex)]
    const innerMatches = Array.isArray(matches) ? matches[0] : ['0']

    return [
        parseInt(innerMatches[1] || '0', 10),
        parseInt(innerMatches[2] || '0', 10),
        parseInt(innerMatches[3] || '0', 10)
    ]
}
