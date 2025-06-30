const app = require('./app');
const http = require("http");
const socketIo = require("socket.io");

const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const { handleSocketConnection } = require("./socket");

handleSocketConnection(io); // webSocket chat connection

const port = process.env.PORT || 1234;

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});