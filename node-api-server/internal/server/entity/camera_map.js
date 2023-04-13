
class CameraMap {
    id = undefined;
    cameraName = undefined;
    address = undefined;
    lat = undefined;
    lng = undefined;
    type = undefined;
    connectCamera = undefined;
    observeIot = undefined;
    area = undefined    

    accept(visitor, o, env) {
        return visitor.visitCameraMap(this, o, env);
    }

    getId() {
        return this.id;
    }

    getCameraName() {
        return this.cameraName;
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

    getConnectCamera() {
        return this.connectCamera;
    }

    getObserveIot() {
        return this.observeIot;
    }

    getArea() {
        return this.area;
    }


    setId(id) {
        this.id = id;
        return this;
    }

    setCameraName(cameraName) {
        this.cameraName = cameraName;
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
    
    setConnectCamera(connectCamera) {
        if (connectCamera == "") this.connectCamera = null;
        else {
            this.connectCamera = connectCamera;
        }
        return this;
    }
    
    setObserveIot(observeIot) {
        if (observeIot == "") this.observeIot = null;
        else {
            this.observeIot = observeIot;
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

function newCameraMap() {
    return new CameraMap();
}

module.exports.newCameraMap = newCameraMap;
