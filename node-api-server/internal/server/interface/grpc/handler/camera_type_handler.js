const { newCameraTypeService } = require("../../../service/camera_type_service");
const { newCameraType } = require("../../../entity/camera_type");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class CameraTypeHandler extends Handler {
    constructor(service=newCameraTypeService()) {
        super();
        this.service = service;
    }

    getAllCameraTypes(call, callback) {
        this.service.getAllCameraTypes()
        .then(cameraTypes => {
               
            cameraTypes = cameraTypes.map(cameraType => {
                return this.toProtobufConverter.visit(cameraType);
            })

            this.success({ 
                camera_types: cameraTypes 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createCameraType(call, callback) {
        let cameraType = this.fromProtobufConverter.visit(newCameraType(), call.request.camera_type_detail);
        this.service.createCameraType(cameraType)
        .then(cameraType => {
            cameraType = this.toProtobufConverter.visit(cameraType);
            this.success({
                camera_type_detail: cameraType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getCameraTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findCameraTypeById(id)
        .then(cameraType => {
            
            cameraType = this.toProtobufConverter.visit(cameraType);
            this.success({
                camera_type_detail: cameraType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateCameraTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let cameraType = this.fromProtobufConverter.visit(newCameraType(), call.request.camera_type_detail);
        this.service.updateCameraTypeById(id, cameraType)
        .then(cameraType => {
            
            cameraType = this.toProtobufConverter.visit(cameraType);
            this.success({
                camera_type_detail: cameraType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteCameraTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteCameraTypeById(id)
        .then(cameraType => {
            
            cameraType = this.toProtobufConverter.visit(cameraType);
            this.success({
                camera_type_detail: cameraType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newCameraTypeHandler() {
    return new CameraTypeHandler();
}

module.exports.newCameraTypeHandler = newCameraTypeHandler;
