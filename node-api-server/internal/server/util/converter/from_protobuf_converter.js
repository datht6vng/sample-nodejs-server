


const { newId } = require("../../entity/id");
const { newArea } = require("../../entity/area");



class FromProtobufConverter {
    
}

FromProtobufConverter.prototype.visit = function(entity, o=null, env=null) {
    return entity.accept(this, o, env);
}

FromProtobufConverter.prototype.visitId = function(id, o, env) {
    // check env to find attribute name should be accessed 
    if (env && env.id_attribute_name) {
        id.setValue(o[env.id_attribute_name]);
    }
    else {
        id.setValue(o._id);
    }        

    return id;
}

FromProtobufConverter.prototype.visitArea = function(area, o, env) {

    // const children = o.children?.map(e => {
    //     this.visit(e instanceof ObjectId ? newId() : newArea(), o);
    // });
    area.setId(this.visit(newId(), o))
        .setAreaName(o.area_name)
        .setAddress(o.address)
        .setMapUrl(o.map_url)
        // .setChildren(children);
        .setFloorNumber(o.floor_number)
        .setLat(o.lat)
        .setLng(o.lng)
        .setAreaType(o.area_type)

    if (o.parent_area) {
        area.setParentArea(typeof(o.parent_area) != 'object' ? this.visit(newId(), o, { id_attribute_name: 'parent_area' }) : this.visit(newArea(), o.parent_area))
    }
    else area.setParentArea(o.parent_area);

    return area;
}

function newFromProtobufConverter() {
    return new FromProtobufConverter();
}

module.exports.newFromProtobufConverter = newFromProtobufConverter;
