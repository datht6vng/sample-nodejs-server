
class IotEventNewMessage {
    constructor(zone, eventTime) {
        this.zone = zone;
        this.eventTime = eventTime;
    }
}

function newIotEventNewMessage(zone, eventTime) {
    return new IotEventNewMessage(zone, eventTime);
}

module.exports.newIotEventNewMessage = newIotEventNewMessage;
