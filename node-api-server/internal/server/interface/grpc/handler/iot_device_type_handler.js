const { newIotDeviceTypeService } = require("../../../service/iot_device_type_service");
const { newIotDeviceType } = require("../../../entity/iot_device_type");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class IotDeviceTypeHandler extends Handler {
    constructor(service=newIotDeviceTypeService()) {
        super();
        this.service = service;
    }

    getAllIotDeviceTypes(call, callback) {
        this.service.getAllIotDeviceTypes()
        .then(iotDeviceTypes => {
               
            iotDeviceTypes = iotDeviceTypes.map(iotDeviceType => {
                return this.toProtobufConverter.visit(iotDeviceType);
            })

            this.success({ 
                iot_device_types: iotDeviceTypes 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createIotDeviceType(call, callback) {
        let iotDeviceType = this.fromProtobufConverter.visit(newIotDeviceType(), call.request.iot_device_type_detail);
        this.service.createIotDeviceType(iotDeviceType)
        .then(iotDeviceType => {
            iotDeviceType = this.toProtobufConverter.visit(iotDeviceType);
            this.success({
                iot_device_type_detail: iotDeviceType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getIotDeviceTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findIotDeviceTypeById(id)
        .then(iotDeviceType => {
            
            iotDeviceType = this.toProtobufConverter.visit(iotDeviceType);
            this.success({
                iot_device_type_detail: iotDeviceType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateIotDeviceTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let iotDeviceType = this.fromProtobufConverter.visit(newIotDeviceType(), call.request.iot_device_type_detail);
        this.service.updateIotDeviceTypeById(id, iotDeviceType)
        .then(iotDeviceType => {
            
            iotDeviceType = this.toProtobufConverter.visit(iotDeviceType);
            this.success({
                iot_device_type_detail: iotDeviceType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteIotDeviceTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteIotDeviceTypeById(id)
        .then(iotDeviceType => {
            
            iotDeviceType = this.toProtobufConverter.visit(iotDeviceType);
            this.success({
                iot_device_type_detail: iotDeviceType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newIotDeviceTypeHandler() {
    return new IotDeviceTypeHandler();
}

module.exports.newIotDeviceTypeHandler = newIotDeviceTypeHandler;
