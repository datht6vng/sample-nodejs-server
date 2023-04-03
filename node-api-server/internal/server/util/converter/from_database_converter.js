


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
        // // check env to find attribute name should be accessed 
        // if (env && env.id_attribute_name) {
        //     id.setValue(doc[env.id_attribute_name]);
        // }
        // else {
        //     id.setValue(doc._id);
        // }        
        
        // return id;

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
    
        if (doc.parent_area) {
            area.setParentArea(doc.parent_area instanceof ObjectId ? this.visit(newId(), doc.parent_area) : this.visit(newArea(), doc.parent_area))
        }
        return area;
    }

    visitCameraMap(cameraMap, doc, env) {
        if (!doc) return cameraMap;
        cameraMap.setCameraName(doc.camera_name)
            .setAddress(doc.address)
            .setLat(doc.lat)
            .setLng(doc.lng)
            .setType(doc.type)

        if (doc.connect_camera) {
            cameraMap.setConnectCamera(doc.connect_camera instanceof ObjectId ? this.visit(newId(), doc.connect_camera) : this.visit(newCamera(), doc.connect_camera));
        }
        if (doc.observe_iot) {
            cameraMap.setObserveIot(doc.observe_iot instanceof ObjectId ? this.visit(newId(), doc.observe_iot) : this.visit(newIotDeviceMap(), doc.observe_iot));
        }
        if (doc.area) {
            cameraMap.setArea(doc.area instanceof ObjectId ? this.visit(newId(), doc.area) : this.visit(newArea(), doc.area));
        }
        return cameraMap;
                 
    }
}

function newFromDatabaseConverter() {
    return new FromDatabaseConverter();
}

module.exports.newFromDatabaseConverter = newFromDatabaseConverter;
