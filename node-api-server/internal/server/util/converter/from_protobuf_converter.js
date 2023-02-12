
const { newId } = require("../../entity/id");
const { newArea } = require("../../entity/area");



class FromProtobufConverter {
    
}

FromProtobufConverter.prototype.visit = function(entity, o=null, env=null) {
    return entity.accept(this, o, env);
}

FromProtobufConverter.prototype.visitId = function(entity, o, env) {
    if (o) {
        // check env to find attribute name should be accessed 
        if (env && env.id_attribute_name) {
            entity.setValue(o[env.id_attribute_name]);
        }
        else {
            entity.setValue(o._id);
        }        
    }

    return entity;
}

FromProtobufConverter.prototype.visitArea = function(entity, o, env) {
    if (o) {
        
        const children = o.children?.map(e => {
            this.visit(e instanceof ObjectId ? newId() : newArea(), o);
        });
        entity.setId(this.visit(newId(), o))
            .setAreaName(o.area_name)
            .setAddress(o.address)
            .setMapUri(o.map_uri)
            .setParent(o.parent ? this.visit(newId(), o, { id_attribute_name: 'parent' }) : o.parent)
            .setChildren(children);
        
        
    }

    return entity;
}

function newFromProtobufConverter() {
    return new FromProtobufConverter();
}

module.exports.newFromProtobufConverter = newFromProtobufConverter;
