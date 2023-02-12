class Area {
    id = null;
    areaName = null;
    address = null;
    mapUri = null;
    children = null;
    parent = null;

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

Area.prototype.getMapUri = function() {
    return this.mapUri;
}

Area.prototype.getChildren = function() {
    return this.children;
}

Area.prototype.getParent = function() {
    return this.parent;
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

Area.prototype.setMapUri = function(mapUri) {
    this.mapUri = mapUri;
    return this;
}

Area.prototype.setChildren = function(children) {
    // if (children && Array.isArray(children)) {
    //     this.children = children;
    // }
    this.children = children;
    return this;
}

Area.prototype.setParent = function(parent) {
    this.parent = parent;
    return this;
}

function newArea() {
    return new Area();
}

module.exports.newArea = newArea;
