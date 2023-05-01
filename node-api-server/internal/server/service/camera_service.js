
const { newCameraRepository } = require("../repository/camera_repository");
const { newSfuRtspStreamHandler } = require("../grpc_client/handler/sfu_rtsp_stream_handler");


class CameraService {
    constructor(repository=newCameraRepository()) {
        this.repository = repository;
    }

    satisfyRtspStreamInfo(camera) {
        return camera.getRtspStreamUrl() && camera.getUsername() && camera.getPassword();
    }
    
    hasDifferentStreamInfo(oldCamera, newCamera) {
        return oldCamera.getRtspStreamUrl() != newCamera.getRtspStreamUrl() 
            || oldCamera.getUsername() != newCamera.getUsername()
            || oldCamera.getPassword() != newCamera.getPassword();
    }

    async getAllCameras() {
        const cameras = await this.repository.getAll();
        return cameras;
    }
    
    async createCamera(camera) {
        let cameraEntity = await this.repository.create(camera);
        if (this.satisfyRtspStreamInfo(cameraEntity)) {
            const sfuRtspUrl = await this.createNewSfuRtspUrl(camera);
            cameraEntity.setSfuRtspStreamUrl(sfuRtspUrl);
            cameraEntity = await this.repository.findByIdAndUpdate(cameraEntity.getId(), cameraEntity);    
        }
        return cameraEntity; 
    }
    
    async findCameraById(cameraId) {
        const cameraEntity = await this.repository.findById(cameraId);
        return cameraEntity;
    }
    
    async updateCameraById(cameraId, cameraDetail) {
        let newCameraEntity = cameraDetail;
        const cameraEntity = await this.repository.findByIdAndUpdate(cameraId, cameraDetail, true);
        if (cameraEntity.getId() && this.hasDifferentStreamInfo(cameraEntity, newCameraEntity) && this.satisfyRtspStreamInfo(newCameraEntity)) {
            const sfuRtspUrl = await this.updateSfuRtspUrl(cameraEntity, newCameraEntity);
            newCameraEntity.setSfuRtspStreamUrl(sfuRtspUrl);
            newCameraEntity = await this.repository.findByIdAndUpdate(cameraId, newCameraEntity);
        }
        return newCameraEntity;
    }


    async deleteCameraById(cameraId) {
        const cameraEntity = await this.repository.findByIdAndDelete(cameraId);
        if (cameraEntity.getId() && cameraEntity.getSfuRtspStreamUrl()) {
            await this.deleteSfuRtspUrl(cameraEntity);
        }
        return cameraEntity;
    }

    async createNewSfuRtspUrl(camera) {
        const handler = newSfuRtspStreamHandler();
        const url = await handler.connect(camera);
        return url;
    }

    async updateSfuRtspUrl(oldCamera, newCamera) {
        const handler = newSfuRtspStreamHandler();
        await handler.disconnect(oldCamera);
        const url = await handler.connect(newCamera);
        return url;
    }

    async deleteSfuRtspUrl(camera) {
        const handler = newSfuRtspStreamHandler();
        await handler.disconnect(camera);
    }
}



function newCameraService(repository=newCameraRepository()) {
    return new CameraService(repository);
}


module.exports.newCameraService = newCameraService;
