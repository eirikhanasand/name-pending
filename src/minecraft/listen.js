import http from 'http';
import url from 'url';

console.log("Receiving messages from server");

const server = http.createServer((req, res) => {
    // Parse the URL to get query parameters
    const parsedUrl = url.parse(req.url, true);

    // Log the query parameters
    console.log('Query Parameters:', parsedUrl.query);

    req.on('data', (data) => {
        console.log(data);
    });

    req.on('end', () => {
        res.end('Stopped listening to Minecraft server!');
    });
});

const PORT = 6969;

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
