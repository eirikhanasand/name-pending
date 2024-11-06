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
    paths_in_queue: number
    domains_in_queue: string[]
}

type Status = {
    cooldown: Date
    archives: number
}

type NameValueObject = {
    name: string
    value: string
}


type ErrorType = {
    cause: {
        code: number
    }
}

type DetailedEvent = {
    id: number | string
    visible: boolean
    name_no: string
    name_en: string
    description_no: string
    description_en: string
    informational_no: string
    informational_en: string
    time_type: string
    time_start: string
    time_end: string
    time_publish: string
    time_signup_release: string
    time_signup_deadline: string
    canceled: boolean
    digital: boolean
    highlight: boolean
    image_small: string
    image_banner: string
    link_facebook: string
    link_discord: string
    link_signup: string
    link_stream: string
    capacity: number | null
    full: boolean
    category: number
    location: null,
    parent: null,
    rule: null,
    updated_at: string
    created_at: string
    deleted_at: string
    category_name_no: string
    category_name_en: string
}

type EventWithOnlyID = {
    id: string
}

type Ticket = {
    id: number
    ticket_id: number
    type_id: number
    sender_id: number
    from: string
    to: string | null
    cc: string | null
    subject: string | null
    message_id: string | number | null
    message_id_md5: string
    in_reply_to: number | null
    content_type: string
    references: string | null
    body: string
    internal: boolean
    preferences: {
        delivery_article_id_related: number
        delivery_message: boolean
        notification: boolean
    },
    updated_by_id: number
    created_by_id: number
    created_at: string
    updated_at: string
    origin_by_id: null
    reply_to: string | number | null
    attachments: string[]
    created_by: string
    updated_by: string
    type: string
    sender: string
    time_unit: any
}
