

class ToDatabaseConverter {
    constructor() {

    }
}

ToDatabaseConverter.prototype.visit = function(entity, o=null, env=null) {
    return entity.accept(this, o, env);
}

ToDatabaseConverter.prototype.visitId = function(entity, o, env) {
    // let result = {};
    // // check env to find attribute name should be returned 
    // if (env && env.id_attribute_name) { 
    //     result[env.id_attribute_name] = entity.getValue();
    // }
    // else {
    //     result._id = entity.getValue()
    // }
    // return result;


    if (entity) {
        return entity.getValue(); 
    }
    return null;
    
}

ToDatabaseConverter.prototype.visitArea = function(entity, o, env) {
    // avoid save undefined value to database
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


function newToDatabaseConverter() {
    return new ToDatabaseConverter();
}

module.exports.newToDatabaseConverter = newToDatabaseConverter;
