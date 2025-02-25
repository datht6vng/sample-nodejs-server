


const { newId } = require("../../entity/id");
const { newArea } = require("../../entity/area");
const { newCameraMap } = require("../../entity/camera_map");
const { newCameraType } = require("../../entity/camera_type");
const { newCamera } = require("../../entity/camera");
const { newEventType } = require("../../entity/event_type");
const { newEvent } = require("../../entity/event");
const { newIotDeviceMap } = require("../../entity/iot_device_map");
const { newIotDeviceType } = require("../../entity/iot_device_type");
const { newIotDevice } = require("../../entity/iot_device");
const ObjectId = require('mongoose').Types.ObjectId;



class FromDatabaseConverter {

    visit(entity, doc=null, env=null) {
        return entity.accept(this, doc, env);
    }

    visitId(id, doc, env) {
        id.setValue(doc);
        return id;
    }


    visitArea(area, doc, env) {    
        if (!doc) return area;

        area.setId(this.visit(newId(), doc._id))
            .setAreaName(doc.area_name)
            .setAddress(doc.address)
            .setMapUrl(doc.map_url)
            .setFloorNumber(doc.floor_number)
            .setLat(doc.lat)
            .setLng(doc.lng)
            .setAreaType(doc.area_type);
    
        this.setEntityWithRefType(area, area.setParentArea, doc.parent_area, newArea());
        return area;
    }

    visitCameraMap(cameraMap, doc, env) {
        if (!doc) return cameraMap;
        cameraMap.setId(this.visit(newId(), doc._id))
            .setCameraName(doc.camera_name)
            .setAddress(doc.address)
            .setLat(doc.lat)
            .setLng(doc.lng)
            .setType(doc.type)

        this.setEntityWithRefType(cameraMap, cameraMap.setConnectCamera, doc.connect_camera, newCamera())
        this.setEntityWithRefType(cameraMap, cameraMap.setObserveIot, doc.observe_iot, newIotDeviceMap())
        this.setEntityWithRefType(cameraMap, cameraMap.setArea, doc.area, newArea());
        return cameraMap;
                 
    }

    visitCamera(camera, doc, env) {
        if (!doc) return camera;
        camera.setId(this.visit(newId(), doc._id))
            .setCameraName(doc.camera_name)
            .setStatus(doc.status)
            .setRtspStreamUrl(doc.rtsp_stream_url)
            .setSfuRtspStreamUrl(doc.sfu_rtsp_stream_url)
            .setOffsetXBegin(doc.offset_x_begin)
            .setOffsetXEnd(doc.offset_x_end)
            .setOffsetYBegin(doc.offset_y_begin)
            .setOffsetYEnd(doc.offset_y_end);

        this.setEntityWithRefType(camera, camera.setCameraType, doc.camera_type, newCameraType())
        this.setEntityWithRefType(camera, camera.setEventType, doc.event_type, newEventType());
    }

    visitCameraType(cameraType, doc, env) {
        if (!doc) return cameraType;
        cameraType.setId(this.visit(newId(), doc._id))
                .setCameraTypeName(doc.camera_type_name)
                .setImageUrl(doc.image_url);
        return cameraType;
    }

    visitEvent(event, doc, env) {
        if (!doc) return event;

        event.setId(this.visit(newId(), doc._id))
            .setAiTrueAlarm(doc.ai_true_alarm)
            .setHumanTrueAlarm(doc.human_true_alarm)
            .setNormalImageUrl(doc.normal_image_url)
            .setNormalVideoUrl(doc.normal_video_url)
            .setDetectionImageUrl(doc.detection_image_url)
            .setDetectionVideoUrl(doc.detection_video_url)
            .setEventTime(doc.event_time)
            .setEventStatus(doc.event_status)
            .setCreatedAt(doc.created_at)
            .setUpdatedAt(doc.updated_at)
        
        this.setEntityWithRefType(event, camera.setIotDevice, doc.iot_device, newIotDevice())
        this.setEntityWithRefType(event, camera.setIotDeviceMap, doc.iot_device_map, newIotDeviceMap())
        this.setEntityWithRefType(event, camera.setCamera, doc.camera, newCamera())
        this.setEntityWithRefType(event, camera.setCameraMap, doc.camera_map, newCameraMap())
    }

    visitEventType(eventType, doc, env) {
        if (!doc) return eventType;

        eventType.setId(this.visit(newId(), doc._id))
            .setEventKey(doc.event_key)
            .setEventName(doc.event_name)
            .setEventDescription(doc.event_description)
        
        return eventType;
    }

    visitIotDeviceMap(iotDeviceMap, doc, env) {
        if (!doc) return iotDeviceMap;

        iotDeviceMap.setId(this.visit(newId(), doc._id))
            .setIotDeviceName(doc.iot_device_name)
            .setAddress(doc.address)
            .setLat(doc.lat)
            .setLng(doc.lng)
            .setType(doc.type)
            .setObservedStatus(doc.observed_status)
        
        this.setEntityWithRefType(iotDeviceMap, iotDeviceMap.setConnectIot, doc.connect_iot, newIotDevice())
        this.setEntityWithRefType(iotDeviceMap, iotDeviceMap.setArea, doc.area, newArea())
        return iotDeviceMap;
    }

    visitIotDevice(iotDevice, doc, env) {
        if (!doc) return iotDevice;

        iotDevice.setId(this.visit(newId(), doc._id))
            .setIotDeviceName(doc.iot_device_name)
            .setZone(doc.zone)
            .setStatus(doc.status)
        
        this.setEntityWithRefType(iotDevice, iotDevice.setIotDeviceType, doc.iot_device_type, newIotDeviceType())
        this.setEntityWithRefType(iotDevice, iotDevice.setEventType, doc.event_type, newEventType());
        return iotDevice;
    }

    visitIotDeviceType(iotDeviceType, doc, env) {
        if (!doc) return iotDeviceType;

        iotDeviceType.setId(this.visit(newId(), doc._id))
            .setIotDeviceTypeName(doc.iot_device_type_name)
            .setImageUrl(doc.image_url);
        return iotDeviceType;
    }

    setEntityWithRefType(entity, setEntityMethod, value, newEntity) {
        setEntityMethod = setEntityMethod.bind(entity);
        if (value) {
            setEntityMethod(value instanceof ObjectId ? this.visit(newId(), value) : this.visit(newEntity, value));
        }
        else setEntityMethod(value);
        return entity;
    }
}

function newFromDatabaseConverter() {
    return new FromDatabaseConverter();
}

module.exports.newFromDatabaseConverter = newFromDatabaseConverter;
