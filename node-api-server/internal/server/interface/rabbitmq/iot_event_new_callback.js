const { newIotEventNewMessage } = require("./event_message/iot_event_new_message");
const { newEvent } = require("../../entity/event");
const { newIotDeviceService } = require("../../service/iot_device_service");
const { newIotDeviceMapService } = require("../../service/iot_device_map_service");
const { newCameraMapService } = require("../../service/camera_map_service");
const { newCameraService } = require("../../service/camera_service");
const { newEventService } = require("../../service/event_service");
const { EventNewCallback } = require("./event_new_callback");

const USED_STATUS = "used";

const OPEN_EVENT = "zone_open";

class IotEventNewCallback extends EventNewCallback {

    constructor() {
        super();
        this.execute = this.execute.bind(this);
        this.iotDeviceService = newIotDeviceService();
        this.iotDeviceMapService = newIotDeviceMapService();
        this.cameraMapService = newCameraMapService();
        this.cameraService = newCameraService();
        this.eventService = newEventService();
    }

    parseMessage(message) {
        let jsonMessage = JSON.parse(message);
        if (!jsonMessage.zone || !jsonMessage.time) return false;
        return newIotEventNewMessage(jsonMessage.zone, jsonMessage.time);
    }

    async execute(message) {
        const routingKey = routingKey;
        const routingKeyArr = routingKey.split(".");
        if (routingKeyArr[routingKeyArr.length - 1] != OPEN_EVENT) return;

        const eventMessage = this.parseMessage(message.content);
        if (!eventMessage) return;
        const iotDevice = await this.iotDeviceService.findIotDeviceByZone(eventMessage.zone);
        const iotDeviceId = iotDevice.getId();
        const eventType = iotDevice.getEventType();
        const eventKey = eventType.getEventKey();
        if (iotDeviceId && eventType) {
            const iotDeviceMap = await this.iotDeviceMapService.findIotDeviceMapByConnectIot(iotDevice.getId());
            const iotDeviceMapId = iotDeviceMap.getId();
            if (iotDeviceMapId && iotDeviceMap.getObservedStatus() == USED_STATUS) {
                const cameraMap = await this.cameraMapService.findCameraMapWithCameraByObserveIot(iotDeviceMapId)
                const cameraMapId = cameraMap.getId();
                if (cameraMapId && cameraMap.getConnectCamera() && cameraMap.getConnectCamera().getId()) {            
                    const camera = cameraMap.getConnectCamera();
                    const cameraId = camera.getId();
                    let event = newEvent();
                    event.setEventType(eventType.getId())
                        .setIotDevice(iotDeviceId)
                        .setIotDeviceMap(iotDeviceMapId)
                        .setEventTime(eventMessage.eventTime)
                    event = await this.eventService.createEvent(event);
                    // const notifyMessage = await this.getAllEventRelationDetailsById(event.getId());
                    this.notifyNewEventToClients(this.toProtobufConverter.visit(event));

                    const videoRecordingInfo = await this.getVideoRecordingInfo(cameraId, eventMessage.eventTime);
                    this.publishEvent(event, camera, videoRecordingInfo, eventKey);
                }
            }
        }
    }
}

function newIotEventNewCallback() {
    return new IotEventNewCallback();
}

module.exports.newIotEventNewCallback = newIotEventNewCallback;
