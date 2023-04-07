const { newIotEventNewMessage } = require("./event_message/iot_event_new_message");

class IotEventNewCallback {

    parseMessage(message) {
        jsonMessage = JSON.parse(message);
        return newIotEventNewMessage(jsonMessage.zone, jsonMessage.event_time);
    }

    execute(message) {
        const eventMessage = this.parseMessage(message);
        
    }
}
