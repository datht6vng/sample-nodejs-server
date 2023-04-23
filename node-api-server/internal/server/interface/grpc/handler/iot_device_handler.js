const { newIotDeviceService } = require("../../../service/iot_device_service");
const { newIotDevice } = require("../../../entity/iot_device");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class IotDeviceHandler extends Handler {
    constructor(service=newIotDeviceService()) {
        super();
        this.service = service;
    }

    getAllIotDevices(call, callback) {
        this.service.getAllIotDevices()
        .then(iotDevices => {
               
            iotDevices = iotDevices.map(iotDevice => {
                return this.toProtobufConverter.visit(iotDevice);
            })

            this.success({ 
                iot_devices: iotDevices 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createIotDevice(call, callback) {
        let iotDevice = this.fromProtobufConverter.visit(newIotDevice(), call.request.iot_device_detail);
        this.service.createIotDevice(iotDevice)
        .then(iotDevice => {
            iotDevice = this.toProtobufConverter.visit(iotDevice);
            this.success({
                iot_device_detail: iotDevice
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getIotDeviceById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findIotDeviceById(id)
        .then(iotDevice => {
            
            iotDevice = this.toProtobufConverter.visit(iotDevice);
            this.success({
                iot_device_detail: iotDevice
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateIotDeviceById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let iotDevice = this.fromProtobufConverter.visit(newIotDevice(), call.request.iot_device_detail);
        this.service.updateIotDeviceById(id, iotDevice)
        .then(iotDevice => {
            
            iotDevice = this.toProtobufConverter.visit(iotDevice);
            this.success({
                iot_device_detail: iotDevice
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteIotDeviceById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteIotDeviceById(id)
        .then(iotDevice => {
            
            iotDevice = this.toProtobufConverter.visit(iotDevice);
            this.success({
                iot_device_detail: iotDevice
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newIotDeviceHandler() {
    return new IotDeviceHandler();
}

module.exports.newIotDeviceHandler = newIotDeviceHandler;
