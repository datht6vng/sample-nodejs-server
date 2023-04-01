class Area {
    id = undefined;
    areaName = undefined;
    address = undefined;
    mapUrl = undefined;
    parentArea = undefined;
    floorNumber = undefined;
    lat = undefined;
    lng = undefined;
    areaType = undefined;


    accept(visitor, o, env) {
        return visitor.visitArea(this, o, env);
    }

    getId() {
        return this.id;
    }

    getAreaName() {
        return this.areaName;
    }

    getAddress() {
        return this.address;
    }

    getMapUrl() {
        return this.mapUrl;
    }

    getParentArea() {
        return this.parentArea;
    }

    getFloorNumber() {
        return this.floorNumber;
    }

    getLat() {
        return this.lat;
    }

    getLng() {
        return this.lng;
    }

    getAreaType() {
        return this.areaType;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    setAreaName(areaName) {
        this.areaName = areaName;
        return this;
    }
    
    setAddress(address) {
        this.address = address;
        return this;
    }
    
    setMapUrl(mapUrl) {
        this.mapUrl = mapUrl;
        return this;
    }
    
    setParentArea(parentArea) {
        this.parentArea = parentArea;
        return this;
    }
    
    setFloorNumber(floorNumber) {
        this.floorNumber = floorNumber;
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
    
    setAreaType(areaType) {
        this.areaType = areaType;
        return this;
    }
}


function newArea() {
    return new Area();
}

module.exports.newArea = newArea;
