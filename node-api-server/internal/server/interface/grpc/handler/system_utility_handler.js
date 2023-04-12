const { newSystemUtilityService } = require("../../../service/system_utility_service");
const { newArea } = require("../../../entity/area");
const { newIotDeviceMap } = require("../../../entity/iot_device_map");
const { newCameraMap } = require("../../../entity/camera_map");
const { Handler } = require("./handler");

class SystemUtilityHandler extends Handler {
    constructor(service=newSystemUtilityService()) {
        super();
        this.service = service;
    }

    crudAllMapUtils(call, callback) {
        let areas = !call.request.areas ? [] : call.request.areas.map(area => {
            return this.fromProtobufConverter.visit(newArea(), area);
        })
        let iotDeviceMaps = !call.request.iot_device_maps ? [] : call.request.iot_device_maps.map(iotDeviceMap => {
            return this.fromProtobufConverter.visit(newIotDeviceMap(), iotDeviceMap);
        })
        let cameraMaps = !call.request.camera_maps ? [] : call.request.camera_maps.map(cameraMap => {
            return this.fromProtobufConverter.visit(newCameraMap(), cameraMap);
        })
        this.service.crudAllMapUtils(areas, iotDeviceMaps, cameraMaps)
        .then(entityObj => {
            areas = entityObj.areas.map(area => {
                return this.toProtobufConverter.visit(area);
            });
            iotDeviceMaps = entityObj.iotDeviceMaps.map(iotDevice => {
                return this.toProtobufConverter.visit(iotDevice);
            });
            cameraMaps = entityObj.cameraMaps.map(cameraMap => {
                return this.toProtobufConverter.visit(cameraMap);
            });


            this.success({ 
                areas: areas,
                iot_device_maps: iotDeviceMaps,
                camera_maps: cameraMaps
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }    
}


function newSystemUtilityHandler() {
    return new SystemUtilityHandler();
}

module.exports.newSystemUtilityHandler = newSystemUtilityHandler;
