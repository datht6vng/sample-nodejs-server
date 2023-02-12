

class ToProtobufConverter {
    constructor() {

    }
}

ToProtobufConverter.prototype.visit = function(entity, o=null, env=null) {
    return entity.accept(this, o, env);
}

ToProtobufConverter.prototype.visitId = function(entity, o, env) {
    if (entity) {
        return entity.getValue(); 
    }
    return null;
}

ToProtobufConverter.prototype.visitArea = function(entity, o, env) {
    // avoid return null or undefined value
    if (entity) {
        let area = {};
        if (entity.getId() != undefined) {
            area._id = this.visit(entity.getId());
        }
        if (entity.getAreaName() != undefined) {
            area.area_name = entity.getAreaName()
        }
        if (entity.getMapUri() != undefined) {
            area.map_uri = entity.getMapUri();
        }
        if (entity.getAddress() != undefined) {
            area.address = entity.getAddress();
        }
        if (entity.getChildren()) {
            area.children = entity.getChildren().map(e => this.visit(e));
        }
        if (entity.getParent() != undefined) {
            area.parent = this.visit(entity.getParent());
        }
        return area;
    }
    return null;
    
}


function newToProtobufConverter() {
    return new ToProtobufConverter();
}

module.exports.newToProtobufConverter = newToProtobufConverter;
