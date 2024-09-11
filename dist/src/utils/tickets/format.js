export default function formatChannelName(name) {
    return name.replace(/ticket(\d+)/i, 'Ticket $1');
}
