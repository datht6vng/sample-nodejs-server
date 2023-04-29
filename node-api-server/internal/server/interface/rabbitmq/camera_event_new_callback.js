const { newCameraEventNewMessage } = require("./event_message/camera_event_new_message");
const { newEvent } = require("../../entity/event");
const { newId } = require("../../entity/id");
const { newCameraService } = require("../../service/camera_service");
const { newCameraMapService } = require("../../service/camera_map_service");
const { newEventService } = require("../../service/event_service");
const { EventNewCallback } = require("./event_new_callback");


class CameraEventNewCallback extends EventNewCallback {

    constructor() {
        super();
        this.execute = this.execute.bind(this);
        this.cameraService = newCameraService();
        this.cameraMapService = newCameraMapService();
        this.eventService = newEventService();
    }

    parseMessage(message) {
        let jsonMessage = JSON.parse(message);
        let cameraEventMessage = newCameraEventNewMessage(jsonMessage.camera_id, jsonMessage.event_time, jsonMessage.image_url, jsonMessgae.detection_image_url, jsonMessage.event_key);
        if (jsonMessage.line_coords) {
            cameraEventMessage.setLineCoords(jsonMessage.line_coords);
        }
        return cameraEventMessage;
    }

    async execute(message) {
        const eventMessage = this.parseMessage(message.content);
        if (!eventMessage) return;
        const camera = await this.cameraService.findCameraById(newId(eventMessage.cameraId));
        const cameraId = camera.getId();
        const eventKey = eventMessage.eventKey;
        const eventType = camera.getEventType();
        if (cameraId && eventType) {
            const cameraMap = this.cameraMapService.findCameraMapByConnectCamera(cameraId);
            const cameraMapId = cameraMap.getId();
            if (cameraMapId) {
                let event = newEvent();
                event.setCamera(cameraId)
                    .setCameraMap(cameraMapId)
                    .setEventTime(eventMessage.eventTime)
                    .setEventType(camera.getEventType())
                    .setNormalImageUrl(eventMessage.normalImageUrl)
                    .setDetectionImageUrl(eventMessage.detectionImageUrl)
                event = await this.eventService.createEvent(event);
                const videoRecordingInfo = await this.getVideoRecordingInfo(cameraId, eventMessage.eventTime);
                this.publishEvent(event, camera, videoRecordingInfo, eventKey);
            }
        }
    }
}

function newCameraEventNewCallback() {
    return new CameraEventNewCallback();
}

module.exports.newCameraEventNewCallback = newCameraEventNewCallback;
