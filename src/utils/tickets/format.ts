export default function formatChannelName(name: string) {
    return name.replace(/ticket(\d+)/i, 'Ticket $1')
}