
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

    connectToRtspSender = false;
    connectToAi = false;

    hostname = undefined;
    port = undefined;
    streamResolution = [];
    iotEventZoneCoords = [];
    cameraEventZoneCoords = [];

    mergeCopy(camera) {
        for (let attr in this) {
            if (key != "connectToRtspSender" && key != "connectToAi") {
                this.copyIfUndefined(attr, camera);
            }
            
        }
    }

    copyIfUndefined(attributeName, fromCamera) {
        if (this[attributeName] == undefined) {
            this[attributeName] = fromCamera[attributeName];
        }
    }


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
    
    getConnectToRtspSender() {
        return this.connectToRtspSender;
    }

    getConnectToAi() {
        return this.connectToAi;
    }





    getHostname() {
        return this.hostname;
    }

    getPort() {
        return this.port;
    }

    getStreamResolution() {
        return this.streamResolution;
    }

    getIotEventZoneCoords() {
        return this.iotEventZoneCoords;
    }

    getCameraEventZoneCoords() {
        return this.cameraEventZoneCoords;
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

    setConnectToRtspSender(connectToRtspSender) {
        this.connectToRtspSender = connectToRtspSender;
        return this;
    }

    setConnectToAi(connectToAi) {
        this.connectToAi = connectToAi;
        return this;
    }




    setHostname(hostname) {
        this.hostname = hostname;
        return this;
    }

    setPort(port) {
        this.port = port;
        return this;
    }


    setStreamResolution(streamResolution) {
        this.streamResolution = streamResolution;
        return this;
    }

    setIotEventZoneCoords(iotEventZoneCoords) {
        this.iotEventZoneCoords = iotEventZoneCoords;
        return this;
    }

    setCameraEventZoneCoords(cameraEventZoneCoords) {
        this.cameraEventZoneCoords = cameraEventZoneCoords;
        return this;
    }
}



function newCamera() {
    return new Camera();
}

module.exports.newCamera = newCamera;
