
class CameraEventNewMessage {
    constructor(cameraId, eventTime, normalImageUrl, detectionImageUrl, eventKey) {
        this.cameraId = cameraId;
        this.eventTime = eventTime;
        this.normalImageUrl = normalImageUrl;
        this.detectionImageUrl = detectionImageUrl;
        this.eventKey = eventKey;
    }

    setLineCoords(lineCoords) {
        this.lineCoords = lineCoords;
    }
}

function newCameraEventNewMessage(cameraId, eventTime, normalImageUrl, detectionImageUrl, eventKey) {
    return new CameraEventNewMessage(cameraId, eventTime, normalImageUrl, detectionImageUrl, eventKey);
}

module.exports.newCameraEventNewMessage = newCameraEventNewMessage;
