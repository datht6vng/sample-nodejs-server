
class IotEventNewMessage {
    constructor(zone, eventTime) {
        this.zone = zone;
        eventTime = new Date(eventTime);
        this.eventTime = eventTime.toISOString();
    }
}

function newIotEventNewMessage(zone, eventTime) {
    return new IotEventNewMessage(zone, eventTime);
}

module.exports.newIotEventNewMessage = newIotEventNewMessage;
