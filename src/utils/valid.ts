const validCommands = [
    'add_role_to_ticket',
    'add_user_to_ticket',
    'archive_ticket',
    'close_ticket',
    'add_tag_to_create',
    'add_role_to_create',
    'add_user_to_create',
    'remove_role_from_ticket',
    'remove_user_from_ticket',
    'reopen_channel',
    'add_tag_to_open_ticket',
    'view_ticket_command',
    'add_role_to_view_ticket_command',
    'add_user_to_view_ticket_command',
    'create_ticket',
    'view_ticket',
    'tag_ticket',
    'reopen_ticket',
    'create',
    'ticket',
    'close',
    'reopen',
    'tagticket',
    'add',
    'remove',
    'get',
    'view',
    'close_ticket_selected',
    'addviewer',
    'add_role_viewer_to_ticket',
    'add_user_viewer_to_ticket',
]

const exceptions = [
    'ticket_modal',
    'previous_page_help',
    'next_page_help'
]

export default validCommands
export { exceptions }
