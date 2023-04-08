const { newCameraService } = require("../../../service/camera_service");
const { newCamera } = require("../../../entity/camera");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class CameraHandler extends Handler {
    constructor(service=newCameraService()) {
        super();
        this.service = service;
    }

    getAllCameras(call, callback) {
        this.service.getAllCameras()
        .then(cameras => {
               
            cameras = cameras.map(camera => {
                return this.toProtobufConverter.visit(camera);
            })

            this.success({ 
                cameras: cameras 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createCamera(call, callback) {
        let camera = this.fromProtobufConverter.visit(newCamera(), call.request.camera_detail);
        this.service.createCamera(camera)
        .then(camera => {
            camera = this.toProtobufConverter.visit(camera);
            this.success({
                camera_detail: camera
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getCameraById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findCameraById(id)
        .then(camera => {
            
            camera = this.toProtobufConverter.visit(camera);
            this.success({
                camera_detail: camera
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateCameraById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let camera = this.fromProtobufConverter.visit(newCamera(), call.request.camera_detail);
        this.service.updateCameraById(id, camera)
        .then(camera => {
            
            camera = this.toProtobufConverter.visit(camera);
            this.success({
                camera_detail: camera
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteCameraById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteCameraById(id)
        .then(camera => {
            
            camera = this.toProtobufConverter.visit(camera);
            this.success({
                camera_detail: camera
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newCameraHandler() {
    return new CameraHandler();
}

module.exports.newCameraHandler = newCameraHandler;
