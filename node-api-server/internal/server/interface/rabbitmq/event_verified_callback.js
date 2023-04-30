
const { newEventVerifiedMessage } = require("./event_message/event_verified_message");
const { newEvent } = require("../../entity/event");
const { newId } = require("../../entity/id");
const { newEventService } = require("../../service/event_service");

AI_VERIFIED_STATUS = "ai_verified"

class EventVerifiedCallback {

    constructor() {
        this.execute = this.execute.bind(this);
        this.eventService = newEventService();
    }

    parseMessage(message) {
        let jsonMessage = JSON.parse(message);
        console.log(jsonMessage)
        return newEventVerifiedMessage(jsonMessage.event_id, jsonMessage.normal_image_url, jsonMessage.detection_image_url, jsonMessage.normal_video_url, jsonMessage.detection_video_url, jsonMessage.true_alarm);
    }

    async execute(message) {
        const eventMessage = this.parseMessage(message.content);
        let event = newEvent();
        event.setNormalImageUrl(eventMessage.normalImageUrl)
            .setNormalVideoUrl(eventMessage.normalVideoUrl)
            .setDetectionImageUrl(eventMessage.detectionImageUrl)
            .setDetectionVideoUrl(eventMessage.detectionVideoUrl)
            .setAiTrueAlarm(eventMessage.trueAlarm)
            .setEventStatus(AI_VERIFIED_STATUS);
        const updatedEvent = await this.eventService.updateEventById(newId(eventMessage.eventId), event);
    }

}

function newEventVerifiedCallback() {
    return new EventVerifiedCallback();
}

module.exports.newEventVerifiedCallback = newEventVerifiedCallback;
