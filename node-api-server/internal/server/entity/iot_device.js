
class IotDevice {
    id = undefined;
    iotDeviceName = undefined;
    configZone = undefined;
    eventType = undefined;
    // status = undefined;

    avatarImageUrl = undefined;
    extraInformation = undefined;


    camera = undefined;
    area = undefined;
}

IotDevice.prototype.accept = function(visitor, o, env) {
    return visitor.visitIotDevice(this, o, env);
}

IotDevice.prototype.getId = function() {
    return this.id;
}

IotDevice.prototype.getIotDeviceName = function() {
    return this.iotDeviceName;
}

IotDevice.prototype.getConfigZone = function() {
    return this.configZone;
}

IotDevice.prototype.getEventType = function() {
    return this.eventType;
}

IotDevice.prototype.getAvatarImageUrl = function() {
    return this.avatarImageUrl;
}

IotDevice.prototype.getExtraInformation = function() {
    return this.extraInformation;
}

IotDevice.prototype.getCamera = function() {
    return this.camera;
}

IotDevice.prototype.getArea = function() {
    return this.area;
}


IotDevice.prototype.setId = function(id) {
    this.id = id;
    return this;
}

IotDevice.prototype.setIotDeviceName = function(iotDeviceName) {
    this.iotDeviceName = iotDeviceName;
    return this;
}

IotDevice.prototype.setConfigZone = function(configZone) {
    this.configZone = configZone;
    return this;
}

IotDevice.prototype.setEventType = function(eventType) {
    this.eventType = eventType;
    return this;
}

IotDevice.prototype.setAvatarImageUrl = function(avatarImageUrl) {
    this.avatarImageUrl = avatarImageUrl;
    return this;
}

IotDevice.prototype.setExtraInformation = function(extraInformation) {
    this.extraInformation = extraInformation;
    return this;
}

IotDevice.prototype.setCamera = function(camera) {
    this.camera = camera;
    return this;
}

IotDevice.prototype.setArea = function(area) {
    this.area = area;
    return this;
}


function newIotDevice() {
    return new newIotDevice();
}

module.exports.newIotDevice = newIotDevice;
