import http from 'http'

console.log("Recieving messages from server")

const server = http.createServer((req, res) => {
    req.on('data', (data) => {
        console.log(data)
    })

    req.on('end', () => {
        res.end('Stopped listening to Minecraft server!')
    })
})

const PORT = 6969;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})