const { newProducer } = require("./producer");
const { config } = require("../../../../pkg/config/config");
const { newExchange } = require("./handler/exchange");
const { newQueue } = require("./handler/queue");
const { newCameraEventNewPublishMessage } = require("./event_message/camera_event_new_publish_message");
const{ newIotEventNewPublishMessage } = require("./event_message/iot_event_new_publish_message");
const { EventCallback } = require("./event_callback");

const { newSfuRtspStreamHandler } = require("../../grpc_client/handler/sfu_rtsp_stream_handler");

const brokerConfig = config.rabbitmq;
const exchanges = brokerConfig.exchanges;


class EventNewCallback extends EventCallback {

    constructor() {
        super();
    }

    async getVideoRecordingInfo(cameraId, eventTime) {
        /*
            Call grpc client handler here
        */
        const handler = newSfuRtspStreamHandler();
        const res = await handler.getRecordFile(cameraId, eventTime);
        return res;
        // return {
        //     startTime: "2023-04-29T11:00:00Z",
        //     endTime: "2023-04-29T11:00:50Z",
        //     normalVideoUrl: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/people-detection.mp4"
        // }
    }
    
    isCameraEvent(event) {
        return event.getCamera();
    }

    getPublishEventMessage(event, cameraDevice, videoRecordingInfo, eventKey) {
        const isCamera = this.isCameraEvent(event);
        
        const eventId = event.getId().getValue();
        const eventTime = event.getEventTime();
        const normalVideoUrl = videoRecordingInfo.normalVideoUrl;
        const startTime = videoRecordingInfo.startTime;
        const endTime = videoRecordingInfo.endTime;
        const normalImageUrl = isCamera ? event.getNormalImageUrl() : null;
        const detectionImageUrl = isCamera ? event.getDetectionImageUrl() : null;

        const cameraEventZoneCoords = cameraDevice.getCameraEventZoneCoords();
        const iotEventZoneCoords = cameraDevice.getIotEventZoneCoords();

        let lineCoords = [cameraDevice.getOffsetXBegin(), cameraDevice.getOffsetYBegin(), cameraDevice.getOffsetXEnd(), cameraDevice.getOffsetYEnd()];
        lineCoords = isCamera && lineCoords.every(e => e != null && e != undefined) ? lineCoords : null;

        const lineCrossingVector = cameraDevice.getLineCrossingVector();


        let publishMessage = null;
        if (isCamera) {
            publishMessage = newCameraEventNewPublishMessage(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime, normalImageUrl, detectionImageUrl, cameraEventZoneCoords, lineCoords, lineCrossingVector);
        }
        else {
            publishMessage = newIotEventNewPublishMessage(eventId, eventKey, eventTime, normalVideoUrl, startTime, endTime, iotEventZoneCoords);
        }
        return publishMessage;
    }

    async publishEvent(event, cameraDevice, videoRecordingInfo, eventKey) {
        let publishEventMessage = this.getPublishEventMessage(event, cameraDevice, videoRecordingInfo, eventKey);
        let exchange = exchanges.event_processing
        let queue = exchange.queues.event_created_with_media;
        let argExchange = newExchange(exchange.name)
        let argQueue = newQueue(queue.name, queue.binding_keys);
        const routingKey = `${queue.routing_key_prefix.event_created_with_media_iot}.${eventKey}`;
        const producer = newProducer(argExchange, argQueue);

        console.log("Publish event message: ", publishEventMessage);
        
        producer.produceMessage(routingKey, Buffer.from(publishEventMessage.toJson()));
    }

}

function newEventNewCallback() {
    return new EventNewCallback();
}

module.exports.newEventNewCallback = newEventNewCallback;
module.exports.EventNewCallback = EventNewCallback;
