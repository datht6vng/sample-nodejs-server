
class Event {

    id = undefined;
    eventType = undefined;
    eventName = undefined;
    iotDevice = undefined;
    camera = undefined;
    iotDeviceMap = undefined;
    cameraMap = undefined;
    aiTrueAlarm = undefined;
    humanTrueAlarm = undefined;
    normalImageUrl = undefined;
    normalVideoUrl = undefined;
    detectionImageUrl = undefined;
    detectionVideoUrl = undefined;
    eventTime = undefined;
    eventStatus = undefined;
    createdAt = undefined;
    updatedAt = undefined;
    comment = undefined;


    accept(visitor, o, env) {
        return visitor.visitEvent(this, o, env);
    }

    getId() {
        return this.id;
    }
    
    getEventType() {
        return this.eventType;
    }

    getEventName() {
        return this.eventName;
    }

    getIotDevice() {
        return this.iotDevice;
    }

    getCamera() {
        return this.camera;
    }

    getIotDeviceMap() {
        return this.iotDeviceMap;
    }

    getCameraMap() {
        return this.cameraMap;
    }

    getAiTrueAlarm() {
        return this.aiTrueAlarm;
    }

    getHumanTrueAlarm() {
        return this.humanTrueAlarm;
    }

    getNormalImageUrl() {
        return this.normalImageUrl;
    }

    getNormalVideoUrl() {
        return this.normalVideoUrl;
    }

    getDetectionImageUrl() {
        return this.detectionImageUrl;
    }

    getDetectionVideoUrl() {
        return this.detectionVideoUrl;
    }

    getEventTime() {
        return this.eventTime;
    }

    getEventStatus() {
        return this.eventStatus;
    }

    getCreatedAt() {
        return this.createdAt;
    }

    getUpdatedAt() {
        return this.updatedAt;
    }

    getComment() {
        return this.comment;
    }


    setId(id) {
        this.id = id;
        return this;
    }
    
    setEventType(eventType) {
        if (eventType == "") this.eventType = null;
        else {
            this.eventType = eventType;
        }
        return this;
    }

    setEventName(eventName) {
        this.eventName = eventName;
        return this;
    }
    
    setIotDevice(iotDevice) {
        if (iotDevice == "") this.iotDevice = null;
        else {
            this.iotDevice = iotDevice;
        }
        return this;
    }
    
    setCamera(camera) {
        if (camera == "") this.camera == null;
        else {
            this.camera = camera;
        }
        return this;
    }

    setIotDeviceMap(iotDeviceMap) {
        if (iotDeviceMap == "") this.iotDeviceMap = null;
        else {
            this.iotDeviceMap = iotDeviceMap;
        }
        return this;
    }

    setCameraMap(cameraMap) {
        if (cameraMap == "") this.cameraMap = null;
        else {
            this.cameraMap = cameraMap;
        }
        return this;
    }
    
    setAiTrueAlarm(aiTrueAlarm) {
        this.aiTrueAlarm = aiTrueAlarm;
        return this;
    }
    
    setHumanTrueAlarm(humanTrueAlarm) {
        this.humanTrueAlarm = humanTrueAlarm;
        return this;
    }
    
    setNormalImageUrl(normalImageUrl) {
        this.normalImageUrl = normalImageUrl;
        return this;
    }
    
    setNormalVideoUrl(normalVideoUrl) {
        this.normalVideoUrl = normalVideoUrl;
        return this;
    }
    
    setDetectionImageUrl(detectionImageUrl) {
        this.detectionImageUrl = detectionImageUrl;
        return this;
    }
    
    setDetectionVideoUrl(detectionVideoUrl) {
        this.detectionVideoUrl = detectionVideoUrl;
        return this;
    }
    
    setEventTime(eventTime) {
        this.eventTime = eventTime;
        return this;
    }
    
    setEventStatus(eventStatus) {
        this.eventStatus = eventStatus;
        return this;
    }
    
    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
        return this;
    }
    
    setUpdatedAt(updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    setComment(comment) {
        this.comment = comment;
        return this;
    }
    
}

function newEvent() {
    return new Event();
}

module.exports.newEvent = newEvent;
