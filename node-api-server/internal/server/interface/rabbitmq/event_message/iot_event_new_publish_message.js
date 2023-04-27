
class IotEventNewPublishMessage {
    constructor(eventId, eventTime, normalVideoUrl, startTime, endTime) {
        this.eventId = eventId;
        this.eventTime = eventTime;
        this.normalVideoUrl = normalVideoUrl;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    toJson() {
        let message = {
            _id: this.eventId,
            event_time: this.eventTime,
            normal_video_url: this.normalVideoUrl,
            start_time: this.startTime,
            end_time: this.endTime
        }
        return JSON.stringify(message);
    }
}

function newIotEventNewPublishMessage(eventId, eventTime, normalVideoUrl, startTime, endTime) {
    return new IotEventNewPublishMessage(eventId, eventTime, normalVideoUrl, startTime, endTime);
}

module.exports.newIotEventNewPublishMessage = newIotEventNewPublishMessage;
