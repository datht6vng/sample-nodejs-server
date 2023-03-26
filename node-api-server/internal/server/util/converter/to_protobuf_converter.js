

class ToProtobufConverter {
    constructor() {

    }
}

ToProtobufConverter.prototype.visit = function(entity, o=null, env=null) {
    return entity.accept(this, o, env);
}

ToProtobufConverter.prototype.visitId = function(id, o, env) {
    return id.getValue();
}

ToProtobufConverter.prototype.visitArea = function(area, o, env) {
    // avoid save undefined value to database
    let doc = {};
    if (area.getId() != undefined) {
        doc._id = this.visit(area.getId());
    }
    if (area.getAreaName() != undefined) {
        doc.area_name = area.getAreaName()
    }
    if (area.getMapUrl() != undefined) {
        // doc.map_uri = area.getMapUri();
        doc.map_url = area.getMapUrl();
    }
    if (area.getAddress() != undefined) {
        doc.address = area.getAddress();
    }
    // if (area.getChildren()) {
    //     doc.children = area.getChildren().map(e => this.visit(e));
    // }
    if (area.getParentArea() != undefined) {
        doc.parent_area = this.visit(area.getParentArea());
    }

    if (area.getFloorNumber() != undefined) {
        doc.floor_number = area.getFloorNumber();
    }

    if (area.getLat() != undefined) {
        doc.lat = area.getLat();
    }

    if (area.getLng() != undefined) {
        doc.lng = area.getLng();
    }

    if (area.getAreaType() != undefined) {
        doc.area_type = area.getAreaType();
    }
    return doc;    
}


function newToProtobufConverter() {
    return new ToProtobufConverter();
}

module.exports.newToProtobufConverter = newToProtobufConverter;
