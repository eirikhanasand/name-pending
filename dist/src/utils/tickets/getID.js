export default function getID(command) {
    if (!command)
        return undefined;
    switch (command) {
        case 'create_ticket':
        case 'create':
        case 'ticket': return 'create_ticket';
        case 'view': return 'view_ticket';
        case 'tagticket': return 'tag_ticket';
        case 'close': return 'close_ticket';
        case 'reopen': return 'reopen_ticket';
        case 'add': return 'add';
        case 'addviewer': return 'addviewer';
        case 'remove': return 'remove';
    }
    console.error(`Command ${command} is unmapped in getID.`);
    return `${command} is unmapped in getID.`;
}
