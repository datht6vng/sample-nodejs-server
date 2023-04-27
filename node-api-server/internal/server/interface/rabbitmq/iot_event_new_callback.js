const { newIotEventNewMessage } = require("./event_message/iot_event_new_message");
const { newEvent } = require("../../entity/event");
const { newIotDeviceService } = require("../../service/iot_device_service");
const { newIotDeviceMapService } = require("../../service/iot_device_map_service");
const { newCameraMapService } = require("../../service/camera_map_service");
const { newCameraService } = require("../../service/camera_service");
const { newEventService } = require("../../service/event_service");

const USED_STATUS = "used";

class IotEventNewCallback {

    constructor() {
        this.execute = this.execute.bind(this);
        this.iotDeviceService = newIotDeviceService();
        this.iotDeviceMapService = newIotDeviceMapService();
        this.cameraMapService = newCameraMapService();
        this.cameraService = newCameraService();
        this.eventService = newEventService();
    }

    parseMessage(message) {
        jsonMessage = JSON.parse(message);
        if (!jsonMessage.zone || !jsonMessage.time) return false;
        return newIotEventNewMessage(jsonMessage.zone, jsonMessage.time);
    }

    async execute(message) {
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
                    const cameraId = cameraMap.getConnectCamera().getId();
                    let event = newEvent();
                    event.setEventType(eventType)
                        .setIotDevice(iotDeviceId)
                        .setIotDeviceMap(iotDeviceMapId)
                        .setEventTime(eventMessage.eventTime)

                    event = await this.eventService.createEvent(event);
                    const videoRecordingInfo = await this.getVideoRecordingInfo(cameraId, eventTime);
                    this.publishEvent(event, iotDevice, videoRecordingInfo, eventKey);
                }
            }
        }
    }
}

function newIotEventNewCallback() {
    return new IotEventNewCallback();
}

module.exports.newIotEventNewCallback = newIotEventNewCallback;
