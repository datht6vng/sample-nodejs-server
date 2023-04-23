const { newCameraMapService } = require("../../../service/camera_map_service");
const { newCameraMap } = require("../../../entity/camera_map");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class CameraMapHandler extends Handler {
    constructor(service=newCameraMapService()) {
        super();
        this.service = service;
    }

    getAllCameraMaps(call, callback) {
        this.service.getAllCameraMaps()
        .then(cameraMaps => {
               
            cameraMaps = cameraMaps.map(cameraMap => {
                return this.toProtobufConverter.visit(cameraMap);
            })

            this.success({ 
                camera_maps: cameraMaps 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createCameraMap(call, callback) {
        let cameraMap = this.fromProtobufConverter.visit(newCameraMap(), call.request.camera_map_detail);
        this.service.createCameraMap(cameraMap)
        .then(cameraMap => {
            cameraMap = this.toProtobufConverter.visit(cameraMap);
            this.success({
                camera_map_detail: cameraMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getCameraMapById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findCameraMapById(id)
        .then(cameraMap => {
            
            cameraMap = this.toProtobufConverter.visit(cameraMap);
            this.success({
                camera_map_detail: cameraMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateCameraMapById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let cameraMap = this.fromProtobufConverter.visit(newCameraMap(), call.request.camera_map_detail);
        this.service.updateCameraMapById(id, cameraMap)
        .then(cameraMap => {
            
            cameraMap = this.toProtobufConverter.visit(cameraMap);
            this.success({
                camera_map_detail: cameraMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteCameraMapById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteCameraMapById(id)
        .then(cameraMap => {
            
            cameraMap = this.toProtobufConverter.visit(cameraMap);
            this.success({
                camera_map_detail: cameraMap
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newCameraMapHandler() {
    return new CameraMapHandler();
}

module.exports.newCameraMapHandler = newCameraMapHandler;
