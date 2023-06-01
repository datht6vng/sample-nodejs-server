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

    convertToJson(message) {
        let firstIdx = message.indexOf(':');
        let secondIdx = message.indexOf(':', firstIdx + 1);
        let firstIdxOfComma = message.indexOf(',');

        let zoneVal = message.substring(firstIdx + 1, firstIdxOfComma);
        let timeVal = message.substring(secondIdx + 1, message.length - 1)
        let res = {
            "zone": parseInt(zoneVal),
            "time": timeVal.trim(),
        }

        return res;
    }

    parseMessage(message) {
        
        let res = this.convertToJson(message.toString());
        console.log("res: ", res)
        let jsonMessage = res;
        console.log("jsonMessage: ", jsonMessage)
        if (!jsonMessage.zone || !jsonMessage.time) return false;
        return newIotEventNewMessage(jsonMessage.zone, jsonMessage.time);
    }

    async execute(message) {
        const routingKey = message.fields.routingKey;
        const routingKeyArr = routingKey.split(".");
        if (routingKeyArr[routingKeyArr.length - 1] != OPEN_EVENT) return;

        const eventMessage = this.parseMessage(message.content);
        console.log("Iot event new message from rabbitmq: ", eventMessage);
        if (!eventMessage) return;
        const iotDevice = await this.iotDeviceService.findIotDeviceByZone(eventMessage.zone);
        const iotDeviceId = iotDevice.getId();
        const eventType = iotDevice.getEventType();
        if (iotDeviceId && eventType) {
            const eventKey = eventType.getEventKey();
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
                        .setEventName(eventType.getEventName());
                    event = await this.eventService.createEvent(event);
                    // const notifyMessage = await this.getAllEventRelationDetailsById(event.getId());
                    this.notifyNewEventToClients(this.toProtobufConverter.visit(event));
                    try {
                        const videoRecordingInfo = await this.getVideoRecordingInfo(cameraId, eventMessage.eventTime);
                        this.publishEvent(event, camera, videoRecordingInfo, eventKey);
                    }
                    catch (err) {
                        this.errorHandler.execute(err);
                    }
                }
            }
        }
    }
}

function newIotEventNewCallback() {
    return new IotEventNewCallback();
}

module.exports.newIotEventNewCallback = newIotEventNewCallback;
