
class CameraEventNewPublishMessage {
    constructor(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime, normalImageUrl, detectionImageUrl, lineCoords=null) {
        this.eventId = eventId;
        this.eventKey = eventKey;
        this.eventTime = eventTime;
        this.normalVideoUrl = normalVideoUrl;
        this.startTime = startTime;
        this.endTime = endTime;
        this.normalImageUrl = normalImageUrl;
        this.detectionImageUrl = detectionImageUrl;
        this.lineCoords = lineCoords;
    }

    toJson() {
        let message = {
            _id: this.eventId,
            event_time: this.eventTime,
            event_key: this.eventKey,
            normal_video_url: this.normalVideoUrl,
            start_time: this.startTime,
            end_time: this.endTime,
            normal_image_url: this.normalImageUrl,
            detection_image_url: this.detectionImageUrl
        }
        if (this.lineCoords) message.line_coords = this.lineCoords;
        return JSON.stringify(message);
    }
}

function newCameraEventNewPublishMessage(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime, normalImageUrl, detectionImageUrl, lineCoords=null) {
    return new CameraEventNewPublishMessage(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime, normalImageUrl, detectionImageUrl, lineCoords);
}

module.exports.newCameraEventNewPublishMessage = newCameraEventNewPublishMessage;
