const { newIotEventNewMessage } = require("./event_message/iot_event_new_message");

class IotEventNewCallback {

    static parseMessage(message) {
        jsonMessage = JSON.parse(message);
        return newIotEventNewMessage(jsonMessage.zone, jsonMessage.event_time);
    }

    static execute(message) {
        const eventMessage = this.parseMessage(message);
        
    }
}

module.exports.IotEventNewCallback = IotEventNewCallback;
