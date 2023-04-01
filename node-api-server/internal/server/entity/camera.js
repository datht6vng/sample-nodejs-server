
class Camera {
    id = undefined;
    cameraName = undefined;
    status = undefined;
    rtspStreamUrl = undefined;
    sfuRtspStreamUrl = undefined;
    cameraDeviceType = undefined;
    eventType = undefined;


    accept(visitor, o, env) {
        return visitor.visitCamera(this, o, env);
    }
    
    getId() {
        return this.id;
    }
    
    getCameraName() {
        return this.cameraName;
    }
    
    getStatus() {
        return this.status;
    }
    
    getRtspStreamUrl() {
        return this.rtspStreamUrl;
    }
    
    getSfuRtspStreamUrl() {
        return this.sfuRtspStreamUrl;
    }

    getCameraDeviceType() {
        return this.cameraDeviceType;
    }
    
    getEventType() {
        return this.eventType;
    }
    
    
    
    
    
    setId(id) {
        this.id = id;
        return this;
    }
    
    setCameraName(cameraName) {
        this.cameraName = cameraName;
        return this;
    }

    setStatus(status) {
        this.status = status;
        return this;
    }
    
    setRtspStreamUrl(rtspStreamUrl) {
        this.rtspStreamUrl = this.rtspStreamUrl;
        return this;
    }
    
    setSfuRtspStreasmUrl(sfuRtspStreamUrl) {
        this.sfuRtspStreamUrl = sfuRtspStreamUrl;
        return this;
    }
    
    setCameraDeviceType(cameraDeviceType) {
        this.cameraDeviceType = cameraDeviceType;
        return this;
    }
    
    setEventType(eventType) {
        this.eventType = eventType;
        return this;
    }
}



function newCamera() {
    return new Camera();
}

module.exports.newCamera = newCamera;
