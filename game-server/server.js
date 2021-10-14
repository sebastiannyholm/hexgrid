import express from "express";
import { createServer } from "http";
import socketIo from "socket.io";

const port = process.env.PORT || 4001;
import router from "./src/routes/index.js";

const app = express();
app.use(router);

const server = createServer(app);

const io = socketIo(server); // < Interesting!


io.on("connection", (socket) => {
    console.log("client connecnted");
    getApiAndEmit(socket);

    socket.on("disconnect", () => {
        console.log("client disconnected");
    })
})

function getApiAndEmit(socket) {
    const response = new Date();
    socket.emit("fromAPI", response);
}

server.listen(port, () => console.log("Listening of port ${port}"));