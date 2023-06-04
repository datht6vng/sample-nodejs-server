const { config } = require("../../../../pkg/config/config");
const { socketIO } = require("../../socket_io/socket_io");
const socketIOConfig = config.socket_io;
const EVENT_NEW = socketIOConfig.events.event_new;
const EVENT_VERIFIED = socketIOConfig.events.event_verified;

class EventNotificationCallback {

    constructor() {
        this.io = socketIO;
        this.execute = this.execute.bind(this);
    }

    execute(message) {
        const routingKey = message.fields.routingKey;
        const routingKeyArr = routingKey.split(".");

        const jsonMessage = JSON.parse(message.content);

        if (routingKeyArr[1] == "new") {
            console.log("Emit event new to all clients");
            this.io.emitToAllClients(EVENT_NEW, JSON.stringify(jsonMessage));
        }
        else {
            console.log("Emit event verified to all clients");
            this.io.emitToAllClients(EVENT_VERIFIED, JSON.stringify(jsonMessage));
        }
    }    

}

function newEventNotificationCallback() {
    return new EventNotificationCallback();
}

module.exports.newEventNotificationCallback = newEventNotificationCallback;
