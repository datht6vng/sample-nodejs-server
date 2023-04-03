

class ToDatabaseConverter {
    constructor() {

    }


    visit(entity, o=null, env=null) {
        return entity.accept(this, o, env);
    }
    
    visitId(id, o, env) {
        return id.getValue();
    }
    
    visitArea(area, o, env) {
        // avoid save undefined value to database
        let doc = {};
        if (area.getId() != undefined) {
            doc._id = this.visit(area.getId());
        }
        if (area.getAreaName() != undefined) { 
            doc.area_name = area.getAreaName()
        }
        if (area.getMapUrl() != undefined) {
            doc.map_url = area.getMapUrl();
        }
        if (area.getAddress() != undefined) {
            doc.address = area.getAddress();
        }
        if (area.getParentArea() != undefined) {
            doc.parent_area = area.getParentArea() ? this.visit(area.getParentArea()) : area.getParentArea();
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

    visitCameraMap(cameraMap, o, env) {
        if (cameraMap.getCameraName() != undefined) {
            doc.camera_name = cameraMap.getCameraName();
        }
        if (cameraMap.getAddress() != undefined) {
            doc.address = cameraMap.getAddress();
        }

        if (cameraMap.getLat() != undefined) {
            doc.lat = cameraMap.getLat();
        }

        if (cameraMap.getType() != undefined) {
            doc.type = cameraMap.getType();
        }

        if (cameraMap.getConnectCamera() != undefined) {
            doc.connect_camera = cameraMap.getConnectCamera() ? this.visit(cameraMap.getConnectCamera()) : cameraMap.getConnectCamera();
        }

        if (cameraMap.getObserveIot() != undefined) {
            doc.observe_iot = cameraMap.getObserveIot() ? this.visit(cameraMap.getObserveIot()) : cameraMap.getObserveIot();
        }

        if (cameraMap.getArea() != undefined) {
            doc.area = cameraMap.getArea() ? this.visit(cameraMap.getArea()) : cameraMap.getArea();
        }

        
    }
}




function newToDatabaseConverter() {
    return new ToDatabaseConverter();
}

module.exports.newToDatabaseConverter = newToDatabaseConverter;
