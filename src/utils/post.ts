import config from "#config"

/**
 * Posts the message from Discord on all servers
 */
export default function post(message: string) {
    const url = config.minecraft_server_url
    const name = config.minecraft_server_name
    fetch(`${url}/${name}-message`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: message
    })
}
