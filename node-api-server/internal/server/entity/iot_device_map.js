class IotDeviceMap {
    
    id = undefined;
    iotDeviceName = undefined;
    address = undefined;
    lat = undefined;
    lng = undefined;
    type = undefined;
    observedStatus = undefined;
    connectIot = undefined;
    area = undefined;

    accept(visitor, o, env) {
        return visitor.visitIotDeviceMap(this, o, env);
    }

    getId() {
        return this.id;
    }

    getIotDeviceName() {
        return this.iotDeviceName;
    }

    getAddress() {
        return this.address;
    }

    getLat() {
        return this.lat;
    }

    getLng() {
        return this.lng;
    }

    getType() {
        return this.type;
    }

    getObservedStatus() {
        return this.observedStatus;
    }

    getConnectIot() {
        return this.connectIot;
    }

    getArea() {
        return this.area;
    }




    setId(id) {
        this.id = id;
        return this;
    }
    
    setIotDeviceName(iotDeviceName) {
        this.iotDeviceName = iotDeviceName;
        return this;
    }
    
    setAddress(address) {
        this.address = address;
        return this;
    }
    
    setLat(lat) {
        this.lat = lat;
        return this;
    }
    
    setLng(lng) {
        this.lng = lng;
        return this;
    }
    
    setType(type) {
        this.type = type;
        return this;
    }
    
    setObservedStatus(observedStatus) {
        this.observedStatus = observedStatus;
        return this;
    }
    
    setConnectIot(connectIot) {
        if (connectIot == "") this.connectIot = null;
        else {
            this.connectIot = connectIot;
        }
        return this;
    }
    
    setArea(area) {
        if (area == "") this.area = null;
        else {
            this.area = area;
        }
        return this;
    }
}


function newIotDeviceMap() {
    return new IotDeviceMap();
}

module.exports.newIotDeviceMap = newIotDeviceMap;
