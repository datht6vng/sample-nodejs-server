class Area {
    id = null;
    areaName = null;
    address = null;
    mapUrl = null;
    // children = null;
    parentArea = null;
    
    floorNumber = null;
    lat = null;
    lng = null;
    areaType = null;

}

Area.prototype.accept = function(visitor, o, env) {
    return visitor.visitArea(this, o, env);
}

Area.prototype.getId = function() {
    return this.id;
}

Area.prototype.getAreaName = function() {
    return this.areaName;
}

Area.prototype.getAddress = function() {
    return this.address;
}

Area.prototype.getMapUrl = function() {
    return this.mapUrl;
}

// Area.prototype.getChildren = function() {
//     return this.children;
// }

Area.prototype.getParentArea = function() {
    return this.parentArea;
}

Area.prototype.getFloorNumber = function() {
    return this.floorNumber;
}

Area.prototype.getLat = function() {
    return this.lat;
}

Area.prototype.getLng = function() {
    return this.lng;
}

Area.prototype.getAreaType = function() {
    return this.areaType;
}

Area.prototype.setId = function(id) {
    this.id = id;
    return this;
}

Area.prototype.setAreaName = function(areaName) {
    this.areaName = areaName;
    return this;
}

Area.prototype.setAddress = function(address) {
    this.address = address;
    return this;
}

Area.prototype.setMapUrl = function(mapUrl) {
    this.mapUrl = mapUrl;
    return this;
}

// Area.prototype.setChildren = function(children) {
//     // if (children && Array.isArray(children)) {
//     //     this.children = children;
//     // }
//     this.children = children;
//     return this;
// }

Area.prototype.setParentArea = function(parentArea) {
    this.parentArea = parentArea;
    return this;
}

Area.prototype.setFloorNumber = function(floorNumber) {
    this.floorNumber = floorNumber;
    return this;
}
  
Area.prototype.setLat = function(lat) {
    this.lat = lat;
    return this;
}

Area.prototype.setLng = function(lng) {
    this.lng = lng;
    return this;
}

Area.prototype.setAreaType = function(areaType) {
    this.areaType = areaType;
    return this;
}

function newArea() {
    return new Area();
}

module.exports.newArea = newArea;
