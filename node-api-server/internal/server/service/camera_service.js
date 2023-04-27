
const { newCameraRepository } = require("../repository/camera_repository");
const { newSfuRtspStreamHandler } = require("../grpc_client/handler/sfu_rtsp_stream_handler");


class CameraService {
    constructor(repository=newCameraRepository()) {
        this.repository = repository;
    }

    async getAllCameras() {
        const cameras = await this.repository.getAll();
        return cameras;
    }
    
    async createCamera(camera) {
        const cameraEntity = await this.repository.create(camera);
        return cameraEntity; 
    }
    
    async findCameraById(cameraId) {
        const cameraEntity = await this.repository.findById(cameraId);
        return cameraEntity;
    }
    
    async updateCameraById(cameraId, cameraDetail) {
        const cameraEntity = await this.repository.findByIdAndUpdate(cameraId, cameraDetail);
        return cameraEntity;
    }


    async deleteCameraById(cameraId) {
        const cameraEntity = await this.repository.findByIdAndDelete(cameraId);
        return cameraEntity;
    }

    async getNewSfuRtspUrl(camera) {
        const handler = newSfuRtspStreamHandler();
        const url = handler.connect(camera);
        return url;
    }

    async deleteSfuRtspUrl(camera) {
        const handler = newSfuRtspStreamHandler();
        handler.disconnect(camera);
    }
}



function newCameraService(repository=newCameraRepository()) {
    return new CameraService(repository);
}


module.exports.newCameraService = newCameraService;
