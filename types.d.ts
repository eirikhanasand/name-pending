type RestData = {
    id: string
    application_id: string
    version: string
    default_member_permissions: unknown,
    type: number
    name: string
    name_localizations: unknown,
    description: string
    description_localizations: unknown,
    guild_id: string
    nsfw: boolean
}

type Content = {
    cooldown: number
    archives: number
}

type Stats = {
    total: number
    status: string
    total_domains: number
    total_paths: number
    startTime: number
    progress: number
    domains_in_progress: string[]
    domains_in_fetch_progress: string[]
    domains_in_archive_progress: string[]
    domains_in_archive_queue: string[]
    paths_in_progress: number
    paths_in_archive_progress: string[]
    finished_paths: number
    finished_domains: number
    paths_in_archive_queue: string[]
    domains_in_fetch_queue: string[]
    paths_in_fetch_progress: number
    paths_in_fetch_queue: number
    domains_failed: number
    author: string
    links_generated: number
    links_failed: number
}

type Status = {
    cooldown: Date
    archives: number
}

type NameValueObject = {
    name: string
    value: string
}

type MessageOptions = {
    
}