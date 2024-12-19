type RestData = {
    id: string
    application_id: string
    version: string
    default_member_permissions: unknown
    type: number
    name: string
    name_localizations: unknown
    description: string
    description_localizations: unknown
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
    location: null
    parent: null
    rule: null
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
    }
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

type ReducedMessage = {
    user: string
    content: string
    attachments: Attachment[]
}

type Attachment = {
    name: string
    url: string
}

type ErrorClosed = {
    error: closed
}

type MinimialRepository = {
    id: number
    name: string
    path_with_namespace: string
    default_branch: string
    ssh_url_to_repo: string
    web_url: string
    container_registry_image_prefix: string
    _links: {
        self: string
        issues: string
        merge_requests: string
        repo_branches: string
    }
}

type Repository = {
    id: number
    description: string | null
    name: string
    name_with_namespace: string
    path: string
    path_with_namespace: string
    created_at: string
    default_branch: string
    tag_list: unknown
    topics: string[]
    ssh_url_to_repo: string
    http_url_to_repo: string
    web_url: string
    readme_url: string
    forks_count: number
    avatar_url: string | null
    star_count: number
    last_activity_at: string
    namespace: Namespace
    container_registry_image_prefix: string
    _links: Links
    packages_enabled: boolean
    empty_repo: boolean
    archived: boolean
    visibility: internal | string
    resolve_outdated_diff_discussions: boolean
    container_expiration_policy: ExpirationPolicy
    repository_object_format: string
    issues_enabled: boolean
    merge_requests_enabled: boolean
    wiki_enabled: boolean
    jobs_enabled: boolean
    snippets_enabled: boolean
    container_registry_enabled: boolean
    service_desk_enabled: boolean
    service_desk_address: null
    can_create_merge_request_in: boolean
    issues_access_level: enabled | string
    repository_access_level: enabled | string
    merge_requests_access_level: enabled | string
    forking_access_level: enabled | string
    wiki_access_level: enabled | string
    builds_access_level: enabled | string
    snippets_access_level: enabled | string
    pages_access_level: private | string
    analytics_access_level: enabled | string
    container_registry_access_level: enabled | string
    security_and_compliance_access_level: private | string
    releases_access_level: enabled | string
    environments_access_level: enabled | string
    feature_flags_access_level: enabled | string
    infrastructure_access_level: enabled | string
    monitor_access_level: enabled | string
    model_experiments_access_level: enabled | string
    model_registry_access_level: enabled | string
    emails_disabled: boolean
    emails_enabled: boolean
    shared_runners_enabled: boolean
    lfs_enabled: boolean
    creator_id: number
    import_url: unknown | null
    import_type: unknown | null
    import_status: string
    open_issues_count: number
    description_html: string
    updated_at: string
    ci_default_git_depth: number
    ci_forward_deployment_enabled: boolean
    ci_forward_deployment_rollback_allowed: boolean
    ci_job_token_scope_enabled: boolean
    ci_separated_caches: boolean
    ci_allow_fork_pipelines_to_run_in_parent_project: boolean
    ci_id_token_sub_claim_components: string[]
    build_git_strategy: fetch | string
    keep_latest_artifact: boolean
    restrict_user_defined_variables: boolean
    ci_pipeline_variables_minimum_override_role: maintainer | string
    runners_token: string | null
    runner_token_expiration_interval: number | null
    group_runners_enabled: boolean
    auto_cancel_pending_pipelines: enabled | string
    build_timeout: number
    auto_devops_enabled: boolean
    auto_devops_deploy_strategy: continuous | string
    ci_push_repository_for_job_token_allowed: boolean
    ci_config_path: string
    public_jobs: boolean
    shared_with_groups: unknown[]
    only_allow_merge_if_pipeline_succeeds: boolean
    allow_merge_on_skipped_pipeline: boolean | null
    request_access_enabled: boolean
    only_allow_merge_if_all_discussions_are_resolved: boolean
    remove_source_branch_after_merge: boolean
    printing_merge_request_link_enabled: boolean
    merge_method: merge | string
    squash_option: default_off | string
    enforce_auth_checks_on_uploads: boolean
    suggestion_commit_message: unknown | null
    merge_commit_template: unknown | null
    squash_commit_template: unknown | null
    issue_branch_template: unknown | null
    warn_about_potentially_unwanted_characters: boolean
    autoclose_referenced_issues: boolean
    requirements_enabled: boolean
    requirements_access_level: enabled | string
    security_and_compliance_enabled: boolean
    compliance_frameworks: unknown[]
    permissions: GitlabPermissions
}

type RepositorySimple = {
    id: number
    description: string | null
    name: string
    name_with_namespace: string
    path: string
    path_with_namespace: string
    created_at: string
    default_branch: string
    tag_list: unknown[]
    topics: unknown[]
    ssh_url_to_repo: string
    http_url_to_repo: string
    web_url: string
    readme_url: string
    forks_count: number
    avatar_url: string | null
    star_count: number
    last_activity_at: string
    namespace: Namespace
}

type Namespace = {
    id: number
    name: string
    path: string
    kind: string
    full_path: string
    parent_id: number
    avatar_url: string
    web_url: string
}

type GitlabPermissions = {
    project_access: unknown | null
    group_access: unknown | null
}

type ExpirationPolicy = {
    cadence: "1d" | string
    enabled: boolean
    keep_n: number
    older_than: "90d" | string
    name_regex: ".*" | string
    name_regex_keep: unknown | null
    next_run_at: string
}

type Links = {
    self: string
    issues: string
    merge_requests: string
    repo_branches: string
    labels: string
    events: string
    members: string
    cluster_agents: string
}

type MinimalMergeRequest = {
    id: number
    title: string
    description: string
}

type MergeRequest = {
    id: number
    iid: number
    project_id: number
    title: string
    description: string
    state: 'opened' | string
    created_at: string
    updated_at: string
    merged_by: unknown | null
    merge_user: unknown | null
    merged_at: unknown | null
    closed_by: unknown | null
    closed_at: unknown | null
    target_branch: string
    source_branch: string
    user_notes_count: number
    upvotes: number
    downvotes: number
    author: Author
    assignees: unknown[]
    assignee: unknown | null
    reviewers: unknown[]
    source_project_id: number
    target_project_id: number
    labels: string[]
    draft: boolean
    imported: boolean
    imported_from: 'none' | unknown
    work_in_progress: boolean
    milestone: unknown | null
    merge_when_pipeline_succeeds: boolean
    merge_status: 'can_be_merged' | string
    detailed_merge_status: 'mergeable' | string
    merge_after: unknown | null
    sha: string
    merge_commit_sha: string | null
    squash_commit_sha: null
    discussion_locked: null
    should_remove_source_branch: null
    force_remove_source_branch: boolean
    prepared_at: string
    reference: string
    references: {
      short: string
      relative: string
      full: string
    }
    web_url: string
    time_stats: TimeStats
    squash: boolean
    squash_on_merge: boolean
    task_completion_status: CompletionStatus
    has_conflicts: boolean
    blocking_discussions_resolved: boolean
    approvals_before_merge: unknown | null
}

type Author = {
    id: number
    username: string
    name: string
    state: 'active' | string
    locked: boolean
    avatar_url: string
    web_url: string
}

type Tag = {
    name: string
    message: string
    target: string
    commit: Commit
    release: null
    protected: false
    created_at: null
}

type Commit = {
    id: string
    short_id: string
    created_at: string
    parent_ids: string[]
    title: string
    message: string
    author_name: string
    author_email: string
    authored_date: string
    committer_name: string
    committer_email: string
    committed_date: string
    trailers: object
    extended_trailers: object
    web_url: string
}

type TimeStats = {
    time_estimate: number
    total_time_spent: number
    human_time_estimate: unknown | null
    human_total_time_spent: unknown | null
}

type CompletionStatus = { 
    count: number
    completed_count: number 
}

type Pipeline = {
    id: number
    iid: number
    project_id: number
    sha: string
    ref: string
    status: string
    source: string
    created_at: string
    updated_at: string
    web_url: string
    name: string | null
}

type Job = {
    id: number
    status: string 
    stage: string 
    name: string
    ref: string 
    tag: boolean
    coverage: unknown | null
    allow_failure: boolean 
    created_at: string
    started_at: string 
    finished_at: string 
    erased_at: string | null
    duration: number 
    queued_duration: number 
    user: User
    commit: Commit
    pipeline: Pipeline
    web_url: string
    project: {
        ci_job_token_scope_enabled: boolean
    }
    artifacts: [
        {
            file_type: string
            size: string
            filename: string
            file_format: string | null
        }
    ]
    runner: {
        id: number 
        description: string 
        ip_address: string | null
        active: boolean
        paused: boolean
        is_shared: boolean
        runner_type: string
        name: string | null
        online: boolean
        status: string
    }
    runner_manager: {
        id: number
        system_id: string
        version: string
        revision: string
        platform: string
        architecture: string
        created_at: string
        contacted_at: string
        ip_address: string
        status: string
    }
    artifacts_expire_at: null
    archived: false
    tag_list: unknown[]
}

type MinimalJob = {
    id: number
    status: string
    stage: string
    ref: string
    allow_failure: boolean
    started_at: string
    finished_at: string
    duration: number
    queued_duration: number
    runner: {
        id: number
        description: string
    }
}

type User = {
    id: number
    username: string
    name: string
    state: string
    locked: boolean
    avatar_url: string
    web_url: string
    created_at: string
    bio: string
    location: string
    public_email: string | null
    skype: string
    linkedin: string
    twitter: string
    discord: string
    website_url: string
    organization: string
    job_title: string
    pronouns: string
    bot: boolean
    work_information: unknown | null
    followers: number
    following: number
    local_time: unknown | null
}
