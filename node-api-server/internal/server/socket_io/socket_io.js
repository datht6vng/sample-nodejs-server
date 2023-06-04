const socketIO = require("socket.io");
const { httpServer } = require("../http/http_server");

const defaultOptions = { 
    cors: { origin: "*" }
};

class SocketIO {
    constructor(server=httpServer, options=defaultOptions) {
        this.options = options
        this.io = socketIO(server, options);
        this.initConnection();
    }

    initConnection() {
        this.io.on('connection', (socket) => {
            console.log("A client has just connected to this server");
            socket.on('disconnect', () => {
                console.log('A client has just disconnected');
            });
        })
    }

    getSocket() {
        return this.io;
    }

    emitToAllClients(event, data) {

        console.log("Event emit from socket IO: ", data);

        this.io.emit(event, data);
    }
}

module.exports.socketIO = new SocketIO(); // for singleton design pattern purpose
