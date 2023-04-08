const { newIotDeviceMapService } = require("../../../service/iot_device_map_service");
const { newIotDeviceMap } = require("../../../entity/iot_device_map");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class IotDeviceMapHandler extends Handler {
    constructor(service=newIotDeviceMapService()) {
        super();
        this.service = service;
    }

    getAllIotDeviceMaps(call, callback) {
        this.service.getAllIotDeviceMaps()
        .then(iotDeviceMaps => {
               
            iotDeviceMaps = iotDeviceMaps.map(iotDeviceMap => {
                return this.toProtobufConverter.visit(iotDeviceMap);
            })

            this.success({ 
                iot_device_maps: iotDeviceMaps 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createIotDeviceMap(call, callback) {
        let iotDeviceMap = this.fromProtobufConverter.visit(newIotDeviceMap(), call.request.iot_device_map_detail);
        this.service.createIotDeviceMap(iotDeviceMap)
        .then(iotDeviceMap => {
            iotDeviceMap = this.toProtobufConverter.visit(iotDeviceMap);
            this.success({
                iot_device_map_detail: iotDeviceMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getIotDeviceMapById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findIotDeviceMapById(id)
        .then(iotDeviceMap => {
            
            iotDeviceMap = this.toProtobufConverter.visit(iotDeviceMap);
            this.success({
                iot_device_map_detail: iotDeviceMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateIotDeviceMapById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let iotDeviceMap = this.fromProtobufConverter.visit(newIotDeviceMap(), call.request.iot_device_map_detail);
        this.service.updateIotDeviceMapById(id, iotDeviceMap)
        .then(iotDeviceMap => {
            
            iotDeviceMap = this.toProtobufConverter.visit(iotDeviceMap);
            this.success({
                iot_device_map_detail: iotDeviceMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteIotDeviceMapById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteIotDeviceMapById(id)
        .then(iotDeviceMap => {
            
            iotDeviceMap = this.toProtobufConverter.visit(iotDeviceMap);
            this.success({
                iot_device_map_detail: iotDeviceMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newIotDeviceMapHandler() {
    return new IotDeviceMapHandler();
}

module.exports.newIotDeviceMapHandler = newIotDeviceMapHandler;
