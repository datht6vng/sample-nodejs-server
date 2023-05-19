

class ToDatabaseConverter {
    constructor() {

    }


    visit(entity, o=undefined, env=undefined) {
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
        this.setDocAttribute(area, area.getFloorLevel, "floor_level", doc);
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
        this.setDocAttribute(cameraMap, cameraMap.getAddress, "address", doc);
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
        this.setDocAttribute(camera, camera.getUsername, "username", doc);
        this.setDocAttribute(camera, camera.getPassword, "password", doc);
        this.setDocAttribute(camera, camera.getCameraType, "camera_type", doc, true);
        this.setDocAttribute(camera, camera.getEventType, "event_type", doc, true);
        this.setDocAttribute(camera, camera.getOffsetXBegin, "offset_x_begin", doc);
        this.setDocAttribute(camera, camera.getOffsetYBegin, "offset_y_begin", doc);
        this.setDocAttribute(camera, camera.getOffsetXEnd, "offset_x_end", doc);
        this.setDocAttribute(camera, camera.getOffsetYEnd, "offset_y_end", doc);
        this.setDocAttribute(camera, camera.getIsSetLine, "is_set_line", doc);
        this.setDocAttribute(camera, camera.getConnectToRtspSender, "connect_to_rtsp_sender", doc);
        this.setDocAttribute(camera, camera.getConnectToAi, "connect_to_ai", doc);

        this.setDocAttribute(camera, camera.getHostname, "hostname", doc);
        this.setDocAttribute(camera, camera.getPort, "port", doc);
        this.setDocAttribute(camera, camera.getStreamResolution, "stream_resolution", doc);
        this.setDocAttribute(camera, camera.getIotEventZoneCoords, "iot_event_zone_coords", doc);
        this.setDocAttribute(camera, camera.getCameraEventZoneCoords, "camera_event_zone_coords", doc);

        return doc;
    }

    visitCameraType(cameraType, o, env) {
        let doc = {};
        this.setDocAttribute(cameraType, cameraType.getId, "_id", doc, true);
        this.setDocAttribute(cameraType, cameraType.getCameraTypeName, "camera_type_name", doc);
        this.setDocAttribute(cameraType, cameraType.getImageUrl, "image_url", doc);
        this.setDocAttribute(cameraType, cameraType.getDescription, "description", doc);

        return doc;
    }

    visitEvent(event, o, env) {
        let doc = {};
        this.setDocAttribute(event, event.getId, "_id", doc, true);
        this.setDocAttribute(event, event.getIotDevice, "iot_device", doc, true);
        this.setDocAttribute(event, event.getIotDeviceMap, "iot_device_map", doc, true);
        this.setDocAttribute(event, event.getCameraMap, "camera_map", doc, true);
        this.setDocAttribute(event, event.getCamera, "camera", doc, true);
        this.setDocAttribute(event, event.getAiTrueAlarm, "ai_true_alarm", doc);
        this.setDocAttribute(event, event.getHumanTrueAlarm, "human_true_alarm", doc);
        this.setDocAttribute(event, event.getNormalImageUrl, "normal_image_url", doc);
        this.setDocAttribute(event, event.getDetectionImageUrl, "detection_image_url", doc);
        this.setDocAttribute(event, event.getNormalVideoUrl, "normal_video_url", doc);
        this.setDocAttribute(event, event.getDetectionVideoUrl, "detection_video_url", doc);
        this.setDocAttribute(event, event.getEventTime, "event_time", doc);
        this.setDocAttribute(event, event.getEventStatus, "event_status", doc);
        this.setDocAttribute(event, event.getCreatedAt, "created_at", doc);
        this.setDocAttribute(event, event.getUpdatedAt, "updated_at", doc);
        this.setDocAttribute(event, event.getComment, "comment", doc);
        
        return doc;
    }

    visitEventType(eventType, o, env) {

        let doc = {};
        this.setDocAttribute(eventType, eventType.getId, "_id", doc, true);
        this.setDocAttribute(eventType, eventType.getEventKey, "event_key", doc);
        this.setDocAttribute(eventType, eventType.getEventName, "event_name", doc);
        this.setDocAttribute(eventType, eventType.getEventDescription, "event_description", doc);

        return doc;
    }

    visitIotDeviceMap(iotDeviceMap, o, env) {
        let doc = {};

        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getId, "_id", doc, true);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getIotDeviceName, "iot_device_name", doc);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getAddress, "address", doc);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getLat, "lat", doc);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getLng, "lng", doc);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getType, "type", doc);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getObservedStatus, "observed_status", doc);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getConnectIot, "connect_iot", doc, true);
        this.setDocAttribute(iotDeviceMap, iotDeviceMap.getArea, "area", doc, true);

        return doc;
    }

    visitIotDevice(iotDevice, o, env) {
        let doc = {};

        this.setDocAttribute(iotDevice, iotDevice.getId, "_id", doc, true);
        this.setDocAttribute(iotDevice, iotDevice.getIotDeviceName, "iot_device_name", doc);
        this.setDocAttribute(iotDevice, iotDevice.getZone, "zone", doc);
        this.setDocAttribute(iotDevice, iotDevice.getEventType, "event_type", doc, true);
        this.setDocAttribute(iotDevice, iotDevice.getStatus, "status", doc);
        this.setDocAttribute(iotDevice, iotDevice.getIotDeviceType, "iot_device_type", doc, true);

        return doc;
    }

    visitIotDeviceType(iotDeviceType, o, env) {
        let doc = {};

        this.setDocAttribute(iotDeviceType, iotDeviceType.getId, "_id", doc, true);
        this.setDocAttribute(iotDeviceType, iotDeviceType.getIotDeviceTypeName, "iot_device_type_name", doc);
        this.setDocAttribute(iotDeviceType, iotDeviceType.getImageUrl, "image_url", doc);
        this.setDocAttribute(iotDeviceType, iotDeviceType.getDescription, "description", doc);

        return doc;
    }

    visitUser(user, o, env) {
        let doc = {};

        this.setDocAttribute(user, user.getId, "_id", doc, true);
        this.setDocAttribute(user, user.getUsername, "username", doc);
        this.setDocAttribute(user, user.getPassword, "password", doc);
        this.setDocAttribute(user, user.getRole, "role", doc);

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
