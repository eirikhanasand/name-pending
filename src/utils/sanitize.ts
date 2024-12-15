export default function sanitize(input: string): string {
    return input
        .replace(/[@#:`]/g, '')
        .replace(/<(@|#|:|a:)[^>]+>/g, '')
        .replace(/<script.*?>.*?<\/script>/gi, '')
        .replace(/[<>]/g, '')
        .replace(/[`*_|~]/g, '')
        .trim()
}
