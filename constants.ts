export const ticketIdPattern = /^ticket\d+$|^\d{5,}$/
export const ZAMMAD_URL = 'https://zammad.login.no/#ticket/zoom'
export const DISCORD_URL = 'https://discord.com/channels'
export const MAX_CHANNELS = 50
export const GITLAB_API = "https://gitlab.login.no/api/v4/"
export const GITLAB_BASE = "https://gitlab.login.no"
export const INFRA_PROD_CLUSTER = 149
export const UNKNOWN_VERSION = "unknown version"
export const FALLBACK_TAG = {
    name: "No version released.",
    commit: {
        short_id: "Unknown.",
        created_at: 0,
        title: "Manual commit history unimplemented.",
        author_name: "Unknown.",
        author_email: "Unknown.",
        web_url: `${GITLAB_BASE}/tekkom`
    }
}
