// Query to get the page
export default function getQuery(id: number) {
    return `
        query {
            pages {
                single(id: ${id}) {
                    path
                    title
                    content
                    description
                }
            }
        }
    `
}
