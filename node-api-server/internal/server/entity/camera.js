
class Camera {
    id = undefined;
    cameraName = undefined;
    status = undefined;
    rtspStreamUrl = undefined;
    sfuRtspStreamUrl = undefined;
    username = undefined;
    password = undefined;
    offsetXBegin = undefined;
    offsetXEnd = undefined;
    offsetYBegin = undefined;
    offsetYEnd = undefined;
    isSetLine = undefined;
    cameraType = undefined;
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

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getOffsetXBegin() {
        return this.offsetXBegin;
    }

    getOffsetXEnd() {
        return this.offsetXEnd;
    }

    getOffsetYBegin() {
        return this.offsetYBegin;
    }

    getOffsetYEnd() {
        return this.offsetYEnd;
    }

    getIsSetLine() {
        return this.isSetLine;
    }

    getCameraType() {
        return this.cameraType;
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
        this.rtspStreamUrl = rtspStreamUrl;
        return this;
    }
    
    setSfuRtspStreamUrl(sfuRtspStreamUrl) {
        this.sfuRtspStreamUrl = sfuRtspStreamUrl;
        return this;
    }

    setUsername(username) {
        this.username = username;
        return this;
    }

    setPassword(password) {
        this.password = password;
        return this;
    }

    setOffsetXBegin(offsetXBegin) {
        this.offsetXBegin = offsetXBegin;
        return this;
    }

    setOffsetXEnd(offsetXEnd) {
        this.offsetXEnd = offsetXEnd;
        return this;
    }

    setOffsetYBegin(offsetYBegin) {
        this.offsetYBegin = offsetYBegin;
        return this;
    }

    setOffsetYEnd(offsetYEnd) {
        this.offsetYEnd = offsetYEnd;
        return this;
    }

    setIsSetLine(isSetLine) {
        this.isSetLine = isSetLine;
        return this;
    }
    
    setCameraType(cameraType) {
        if (cameraType == "") this.cameraType = null;
        else {
            this.cameraType = cameraType;
        }
        return this;
    }
    
    setEventType(eventType) {
        if (eventType == "") this.eventType = null;
        else {
            this.eventType = eventType;
        }
        return this;
    }
}



function newCamera() {
    return new Camera();
}

module.exports.newCamera = newCamera;
