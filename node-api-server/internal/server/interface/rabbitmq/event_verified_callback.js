
const { newEventVerifiedMessage } = require("./event_message/event_verified_message");
const { newEvent } = require("../../entity/event");
const { newId } = require("../../entity/id");
const { newEventService } = require("../../service/event_service");

class EventVerifiedCallback {

    constructor() {
        this.eventService = newEventService();
    }

    parseMessage(message) {
        return newEventVerifiedMessage(message.event_id, message.normal_image_url, message.detection_image_url, message.normal_video_url, message.detection_video_url, message.true_alarm);
    }

    async execute(message) {
        const eventMessage = this.parseMessage(message.content);
        let event = newEvent();
        event.setNormalImageUrl(eventMessage.normalImageUrl)
            .setNormalVideoUrl(eventMessage.normalVideoUrl)
            .setDetectionImageUrl(eventMessage.detectionImageUrl)
            .setDetectionVideoUrl(eventMessage.detectionVideoUrl)
            .setAiTrueAlarm(eventMessage.trueAlarm);
        const updatedEvent = await this.eventService.updateEventById(newId(eventMessage.eventId), event);
    }

}

function newEventVerifiedCallback() {
    return new EventVerifiedCallback();
}

module.exports.newEventVerifiedCallback = newEventVerifiedCallback;
