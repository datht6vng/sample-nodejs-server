
class Event {

    id = undefined;
    eventType = undefined;
    iotDevice = undefined;
    camera = undefined;
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


    accept(visitor, o, env) {
        return visitor.visitEvent(this, o, env);
    }

    getId() {
        return this.id;
    }
    
    getEventType() {
        return this.eventType;
    }

    getIotDevice() {
        return this.iotDevice;
    }

    getCamera() {
        return this.camera;
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




    setId(id) {
        this.id = id;
        return this;
    }
    
    setEventType(eventType) {
        this.eventType = eventType;
        return this;
    }
    
    setIotDevice(iotDevice) {
        this.iotDevice = iotDevice;
        return this;
    }
    
    setCamera(camera) {
        this.camera = camera;
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
    
}

function newEvent() {
    return new Event();
}

module.exports.newEvent = newEvent;
