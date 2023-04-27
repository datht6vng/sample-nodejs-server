
class EventVerifiedMessgage {
    constructor(eventId, normalImageUrl, detectionImageUrl, normalVideoUrl, detectionVideoUrl, trueAlarm) {
        this.eventId = eventId;
        this.normalImageUrl = normalImageUrl;
        this.detectionImageUrl = detectionImageUrl;
        this.normalVideoUrl = normalVideoUrl;
        this.detectionVideoUrl = detectionVideoUrl;
        this.trueAlarm = trueAlarm;
    } 
}

function newEventVerifiedMessgage(eventId, normalImageUrl, detectionImageUrl, normalVideoUrl, detectionVideoUrl, trueAlarm) {
    return new EventVerifiedMessgage(eventId, normalImageUrl, detectionImageUrl, normalVideoUrl, detectionVideoUrl, trueAlarm);
}

module.exports.newEventVerifiedMessgage = newEventVerifiedMessgage;
