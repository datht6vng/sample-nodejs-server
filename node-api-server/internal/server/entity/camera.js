
class Camera {
    id = undefined;
    serialNumber = undefined;
    cameraName = undefined;
    avatarImageUrl = undefined;
    // status = undefined;
    extraInformation = undefined;
    iotDevice = undefined;
    area = undefined;
    eventType = undefined;

}

Camera.prototype.accept = function(visitor, o, env) {
    return visitor.visitCamera(this, o, env);
}

Camera.prototype.getId = function() {
    return this.id;
}

Camera.prototype.getSerialNumber = function() {
    return this.serialNumber;
}

Camera.prototype.getCameraName = function() {
    return this.cameraName;
}

Camera.prototype.getAvatarImageUrl = function() {
    return this.avatarImageUrl;
}

Camera.prototype.getExtraInformation = function() {
    return this.extraInformation;
}

Camera.prototype.getIotDevice = function() {
    return this.iotDevice;
}

Camera.prototype.getEventType = function() {
    return this.eventType;
}





Camera.prototype.setId = function(id) {
    this.id = id;
    return this;
}

Camera.prototype.setSerialNumber = function(serialNumber) {
    this.serialNumber = serialNumber;
    return this;
}

Camera.prototype.setCameraName = function(cameraName) {
    this.cameraName = cameraName;
    return this;
}

Camera.prototype.setAvatarImageUrl = function(avatarImageUrl) {
    this.avatarImageUrl = avatarImageUrl;
    return this;
}

Camera.prototype.setExtraInformation = function(extraInformation) {
    this.extraInformation = extraInformation;
    return this;
}

Camera.prototype.setIotDevice = function(iotDevice) {
    this.iotDevice = iotDevice;
    return this;
}

Camera.prototype.setEventType = function(eventType) {
    this.eventType = eventType;
    return this;
}

function newCamera() {
    return new Camera();
}

module.exports.newCamera = newCamera;
