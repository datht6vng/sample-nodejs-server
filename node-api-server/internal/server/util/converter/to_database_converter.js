

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
        this.setDocAttribute(area, area.getId, "_id", doc, true);
        this.setDocAttribute(area, area.getAreaName, "area_name", doc);
        this.setDocAttribute(area, area.getAddress, "address", doc);
        this.setDocAttribute(area, area.getMapUrl, "map_url", doc);
        this.setDocAttribute(area, area.getParentArea, "parent_area", doc, true);
        this.setDocAttribute(area, area.getFloorNumber, "floor_number", doc);
        this.setDocAttribute(area, area.getLat, "lat", doc);
        this.setDocAttribute(area, area.getLng, "lng", doc);
        this.setDocAttribute(area, area.getAreaType, "area_type", doc);
        return doc;
        // if (area.getId() !== undefined) {
        //     doc._id = this.visit(area.getId());
        // }

        // if (area.getAreaName() !== undefined) { 
        //     doc.area_name = area.getAreaName()
        // }
        // if (area.getMapUrl() !== undefined) {
        //     doc.map_url = area.getMapUrl();
        // }
        // if (area.getAddress() !== undefined) {
        //     doc.address = area.getAddress();
        // }
        // if (area.getParentArea() !== undefined) {
        //     doc.parent_area = area.getParentArea() ? this.visit(area.getParentArea()) : area.getParentArea();
        // }
    
        // if (area.getFloorNumber() !== undefined) {
        //     doc.floor_number = area.getFloorNumber();
        // }
    
        // if (area.getLat() !== undefined) {
        //     doc.lat = area.getLat();
        // }
    
        // if (area.getLng() !== undefined) {
        //     doc.lng = area.getLng();
        // }
    
        // if (area.getAreaType() !== undefined) {
        //     doc.area_type = area.getAreaType();
        // }
        // return doc;    
    }

    visitCameraMap(cameraMap, o, env) {
        let doc = {};
        
        this.setDocAttribute(cameraMap, cameraMap.getId, "_id", doc, true);
        this.setDocAttribute(cameraMap, cameraMap.getCameraName, "camera_name", doc);
        this.setDocAttribute(cameraMap, cameraMap.getLat, "lat", doc);
        this.setDocAttribute(cameraMap, cameraMap.getLng, "lng", doc);
        this.setDocAttribute(cameraMap, cameraMap.getType, "type", doc);
        this.setDocAttribute(cameraMap, cameraMap.getConnectCamera, "connect_camera", doc, true);
        this.setDocAttribute(cameraMap, cameraMap.getObserveIot, "observe_iot", doc, true);
        this.setDocAttribute(cameraMap, cameraMap.getArea, "area", doc, true);
        return doc;
    }

    visitCamera(camera, o, env) {
        let doc = {};

        this.setDocAttribute(camera, camera.getId, "_id", doc, true);
        this.setDocAttribute(camera, camera.getCameraName, "camera_name", doc);
        this.setDocAttribute(camera, camera.getStatus, "status", doc);
        this.setDocAttribute(camera, camera.getRtspStreamUrl, "rtsp_stream_url", doc);
        this.setDocAttribute(camera, camera.getSfuRtspStreamUrl, "sfu_rtsp_stream_url", doc);
        this.setDocAttribute(camera, camera.getCameraType, "camera_type", doc, true);
        this.setDocAttribute(camera, camera.getEventType, "event_type", doc, true);
        this.setDocAttribute(camera, camera.getOffsetXBegin, "offset_x_begin", doc);
        this.setDocAttribute(camera, camera.getOffsetYBegin, "offset_y_begin", doc);
        this.setDocAttribute(camera, camera.getOffsetXEnd, "offset_x_end", doc);
        this.setDocAttribute(camera, camera.getOffsetYEnd, "offset_y_end", doc);
        this.setDocAttribute(camera, camera.getIsSetLine, "is_set_line", doc);

        return doc;
    }



    setDocAttribute(entity, getEntityMethod, docAttributeName, doc, isRefType=false) {
        getEntityMethod = getEntityMethod.bind(entity);
        if (getEntityMethod() !== undefined) {
            if (!isRefType) {
                doc[docAttributeName] = getEntityMethod();
            }
            else {
                doc[docAttributeName] = getEntityMethod() ? this.visit(getEntityMethod()) : getEntityMethod();
            }
        }
        return doc;
    }
}




function newToDatabaseConverter() {
    return new ToDatabaseConverter();
}

module.exports.newToDatabaseConverter = newToDatabaseConverter;
