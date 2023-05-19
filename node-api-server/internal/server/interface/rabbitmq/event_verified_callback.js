
const { newEventVerifiedMessage } = require("./event_message/event_verified_message");
const { newEvent } = require("../../entity/event");
const { newId } = require("../../entity/id");
const { newEventService } = require("../../service/event_service");
const { EventCallback } = require("./event_callback");

AI_VERIFIED_STATUS = "ai_verified"

class EventVerifiedCallback extends EventCallback {

    constructor() {
        super();
        this.execute = this.execute.bind(this);
        this.eventService = newEventService();
    }

    parseMessage(message) {
        let jsonMessage = JSON.parse(message);
        console.log("Json message from AI server for verified event: ", jsonMessage)
        return newEventVerifiedMessage(jsonMessage.event_id, jsonMessage.image_url, jsonMessage.detection_image_url, jsonMessage.video_url, jsonMessage.detection_video_url, jsonMessage.true_alarm);
    }

    async execute(message) {
        const eventMessage = this.parseMessage(message.content);
        const eventId = newId(eventMessage.eventId);
        let event = newEvent();
        event.setNormalImageUrl(eventMessage.normalImageUrl)
            .setNormalVideoUrl(eventMessage.normalVideoUrl)
            .setDetectionImageUrl(eventMessage.detectionImageUrl)
            .setDetectionVideoUrl(eventMessage.detectionVideoUrl)
            .setAiTrueAlarm(eventMessage.trueAlarm)
            .setEventStatus(AI_VERIFIED_STATUS);
        
        event = await this.eventService.updateEventById(eventId, event);

        console.log("Event verified from AI: ", event)

        // const notifyMessage = await this.getAllEventRelationDetailsById(eventId);

        this.notifyVerifiedEventToClients(this.toProtobufConverter.visit(event));
    }

}

function newEventVerifiedCallback() {
    return new EventVerifiedCallback();
}

module.exports.newEventVerifiedCallback = newEventVerifiedCallback;
