
class IotEventNewPublishMessage {
    constructor(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime) {
        this.eventId = eventId;
        this.eventKey = eventKey;
        this.eventTime = eventTime;
        this.normalVideoUrl = normalVideoUrl;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    toJson() {
        let message = {
            _id: this.eventId,
            event_key: this.eventKey,
            event_time: this.eventTime,
            normal_video_url: this.normalVideoUrl,
            start_time: this.startTime,
            end_time: this.endTime
        }
        return JSON.stringify(message);
    }
}

function newIotEventNewPublishMessage(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime) {
    return new IotEventNewPublishMessage(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime);
}

module.exports.newIotEventNewPublishMessage = newIotEventNewPublishMessage;
