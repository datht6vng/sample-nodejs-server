const { newCameraStreamInfoService } = require("../../../service/camera_stream_info_service");
const { newCamera } = require("../../../entity/camera");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class CameraStreamInfoHandler extends Handler {
    constructor(service=newCameraStreamInfoService()) {
        super();
        this.service = service;
    }

    getAllCameras(call, callback) {
        this.service.getAllCameras()
        .then(cameras => {
               
            cameras = cameras.map(camera => {
                let cameraStream = this.toProtobufConverter.visit(camera);
                cameraStream.event_key = cameraStream.event_type.event_key;
                return cameraStream;
            })

            this.success({ 
                camera_streams: cameras 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
}


function newCameraStreamInfoHandler() {
    return new CameraStreamInfoHandler();
}

module.exports.newCameraStreamInfoHandler = newCameraStreamInfoHandler;
