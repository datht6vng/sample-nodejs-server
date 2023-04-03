const socket_io = require("socket.io");

const defaultOptions = { 
    cors: { origin: "*" } 
};

class SocketIO {
    constructor(httpServer, options=defaultOptions) {
        this.options = options
        this.io = socket_io(httpServer, options);
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
        this.io.emit(event, data);
    }
}

module.exports.socketIO = new SocketIO(); // for singleton design pattern purpose
