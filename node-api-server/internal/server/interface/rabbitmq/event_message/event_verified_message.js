
class EventVerifiedMessage {
    constructor(eventId, normalImageUrl, detectionImageUrl, normalVideoUrl, detectionVideoUrl, trueAlarm) {
        this.eventId = eventId;
        this.normalImageUrl = normalImageUrl;
        this.detectionImageUrl = detectionImageUrl;
        this.normalVideoUrl = normalVideoUrl;
        this.detectionVideoUrl = detectionVideoUrl;
        this.trueAlarm = trueAlarm;
    } 
}

function newEventVerifiedMessage(eventId, normalImageUrl, detectionImageUrl, normalVideoUrl, detectionVideoUrl, trueAlarm) {
    return new EventVerifiedMessage(eventId, normalImageUrl, detectionImageUrl, normalVideoUrl, detectionVideoUrl, trueAlarm);
}

module.exports.newEventVerifiedMessage = newEventVerifiedMessage;
