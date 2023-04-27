const { newProducer } = require("./producer");
const { config } = require("../../../../pkg/config/config");
const { newExchange } = require("./handler/exchange");
const { newQueue } = require("./handler/queue");
const { newCameraEventNewPublishMessage } = require("./event_message/camera_event_new_publish_mesage");
const{ newIotEventNewPublishMessage } = require("./event_message/iot_event_new_publish_mesage");


const brokerConfig = config.rabbitmq;
const exchanges = brokerConfig.exchanges;


class EventNewCallback {

    async getVideoRecordingInfo(cameraId, eventTime) {
        /*
            Call grpc client handler here
        */
        return {
            startTime: "",
            endTime: "",
            normalVideoUrl: "https://raw.githubusercontent.com/intel-iot-devkit/sample-videos/master/people-detection.mp4"
        }
    }
    
    isCameraEvent(event) {
        return event.getIotDevice();
    }

    getPublishEventMessage(event, eventDevice, videoRecordingInfo) {
        const isCamera = this.isCameraEvent(event);
        const eventId = event.getId().getValue();
        const eventTime = event.getEventTime();
        const normalVideoUrl = videoRecordingInfo.normalVideoUrl;
        const startTime = videoRecordingInfo.startTime;
        const endTime = videoRecordingInfo.endTime;
        const normalImageUrl = isCamera ? event.getNormalImageUrl() : null;
        const detectionImageUrl = isCamera ? event.getDetectionImageUrl() : null;
        const lineCoords = isCamera ? [eventDevice.getOffsetXBegin(), eventDevice.getOffsetXEnd(), eventDevice.getOffsetYBegin(), eventDevice.getOffsetYEnd()] : null;

        let publishMessage = null;
        if (isCamera) {
            publishMessage = newCameraEventNewPublishMessage(eventId, eventTime, normalVideoUrl, startTime, endTime, normalImageUrl, detectionImageUrl, lineCoords);
        }
        else {
            publishMessage = newIotEventNewPublishMessage(eventId, eventTime, normalVideoUrl, startTime, endTime);
        }
        return publishMessage;
    }

    async publishEvent(event, eventDevice, videoRecordingInfo, eventKey) {
        let publishEventMessage = this.getPublishEventMessage(event, eventDevice, videoRecordingInfo);
        let exchange = exchanges.event_processing
        let queue = exchange.queues.event_created_with_media;
        let argExchange = newExchange(exchange.name)
        let argQueue = newQueue(queue.name, queue.binding_keys);
        const routingKey = `${queue.routing_key_prefix.event_created_with_media_iot}.${eventKey}`;
        const producer = newProducer(argExchange, argQueue);
        producer.produceMessage(routingKey, publishEventMessage.toJson());
    }

}

function newEventNewCallback() {
    return new EventNewCallback();
}

module.exports.newEventNewCallback = newEventNewCallback;
module.exports.EventNewCallback = EventNewCallback;
