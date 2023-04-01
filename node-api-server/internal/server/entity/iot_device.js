
class IotDevice {
    id = undefined;
    iotDeviceName = undefined;
    zone = undefined;
    eventType = undefined;
    status = undefined;
    iotDeviceType = undefined;

    accept(visitor, o, env) {
        return visitor.visitIotDevice(this, o, env);
    }

    getId() {
        return this.id;
    }

    getIotDeviceName() {
        return this.iotDeviceName;
    }

    getZone() {
        return this.zone;
    }

    getEventType() {
        return this.eventType;
    }

    getStatus() {
        return this.status;
    }

    getIotDeviceType() {
        return this.iotDeviceType;
    }



    setId(id) {
        this.id = id;
        return this;
    }
    
    setIotDeviceName(deviceName) {
        this.deviceName = deviceName;
        return this;
    }
    
    setZone(zone) {
        this.zone = zone;
        return this;
    }
    
    setEventType(eventType) {
        this.eventType = eventType;
        return this;
    }
    
    setStatus(status) {
        this.status = status;
        return this;
    }
    
    setIotDeviceType(deviceType) {
        this.deviceType = deviceType;
        return this;
    }
}






function newIotDevice() {
    return new newIotDevice();
}

module.exports.newIotDevice = newIotDevice;
