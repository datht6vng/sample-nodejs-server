
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
    
    setIotDeviceName(iotDeviceName) {
        this.iotDeviceName = iotDeviceName;
        return this;
    }
    
    setZone(zone) {
        this.zone = zone;
        return this;
    }
    
    setEventType(eventType) {
        if (eventType == "") this.eventType = null;
        else {
            this.eventType = eventType;
        }
        return this;
    }
    
    setStatus(status) {
        this.status = status;
        return this;
    }
    
    setIotDeviceType(iotDeviceType) {
        if (iotDeviceType == "") this.iotDeviceType = null;
        else {
            this.iotDeviceType = iotDeviceType;
        }
        return this;
    }
}






function newIotDevice() {
    return new IotDevice();
}

module.exports.newIotDevice = newIotDevice;
