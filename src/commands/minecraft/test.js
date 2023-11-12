import { SlashCommandBuilder } from 'discord.js'
import http from 'http'

export const data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('test')
export async function execute(message) {
    await message.reply('Pong!')
}

// const server = http.createServer((req, res) => {
//     let data = ''

//     // Accumulate data as it comes in
//     req.on('data', (chunk) => {
//         data += chunk
//     });

//     // Process the received data when the request ends
//     req.on('end', () => {
//         console.log('Received message:', data)
//         res.end('Message received successfully!')
//     });
// });

// const PORT = 6969

// server.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`)
// })