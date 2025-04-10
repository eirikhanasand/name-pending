import config from "./config.js"

/**
 * Posts the message from Discord on all servers
 */
export default function post(message: string) {
    config.minecraft_servers.forEach((server) => {
        console.log("posting", `https://${server.url}/${server.name}-message`)
        fetch(`https://${server.url}/${server.name}-message`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: message
        })
    })
}