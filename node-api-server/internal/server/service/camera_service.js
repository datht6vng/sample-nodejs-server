
const { newCameraRepository } = require("../repository/camera_repository");
const { newSfuRtspStreamHandler } = require("../grpc_client/handler/sfu_rtsp_stream_handler");
const { newCameraStreamInfoHandler } = require("../grpc_client/handler/camera_stream_info_handler");
// const { logger } = require("../../../pkg/logger/logger");

class CameraService {
    constructor(repository=newCameraRepository()) {
        this.repository = repository;
    }

    async getAllCameras() {
        const cameras = await this.repository.getAll();
        return cameras;
    }
    
    async createCamera(camera) {
        let cameraEntity = await this.repository.create(camera);
        // this.handleCreateCameraStream(cameraEntity);
        return cameraEntity; 
    }
    
    async findCameraById(cameraId, withEventType=false) {
        const cameraEntity = await this.repository.findById(cameraId, withEventType);
        return cameraEntity;
    }
    
    async updateCameraById(cameraId, cameraDetail) {
        // let newCameraEntity = cameraDetail;
        // const cameraEntity = await this.repository.findByIdAndUpdate(cameraId, cameraDetail, true);
        // if (cameraEntity.getId() && this.hasDifferentStreamInfo(cameraEntity, newCameraEntity) && this.satisfyRtspStreamInfo(newCameraEntity)) {
        //     const sfuRtspUrl = await this.updateSfuRtspUrl(cameraEntity, newCameraEntity);
        //     newCameraEntity.setSfuRtspStreamUrl(sfuRtspUrl);
        //     newCameraEntity = await this.repository.findByIdAndUpdate(cameraId, newCameraEntity);
        // }
        // return newCameraEntity;
        const cameraEntity = await this.repository.findByIdAndUpdate(cameraId, cameraDetail);
        return cameraEntity;
    }


    async deleteCameraById(cameraId) {
        const cameraEntity = await this.repository.findByIdAndDelete(cameraId);
        // if (cameraEntity.getId() && cameraEntity.getSfuRtspStreamUrl()) {
        //     await this.deleteSfuRtspUrl(cameraEntity);
        // }
        return cameraEntity;
    }


    // satisfyRtspStreamInfo(camera) {
    //     return camera.getRtspStreamUrl() && camera.getUsername() && camera.getPassword();
    // }
    
    // hasDifferentStreamInfo(oldCamera, newCamera) {
    //     return oldCamera.getRtspStreamUrl() != newCamera.getRtspStreamUrl() 
    //         || oldCamera.getUsername() != newCamera.getUsername()
    //         || oldCamera.getPassword() != newCamera.getPassword();
    // }


    // async handleCreateCameraStream(camera) {
    //     if (this.satisfyRtspStreamInfo(camera)) {
    //         const sfuHandler = newSfuRtspStreamHandler();
    //         const sfuRtspUrl = await sfuHandler.connect(camera);
    //         // camera.setSfuRtspStreamUrl(sfuRtspUrl);
    //         camera.setSfuRtspStreamUrl("rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2");
            
    //         camera = await this.repository.findByIdAndUpdateWithEventType(camera.getId(), camera);  
            
    //         // logger.info(`Camera with _id = ${camera.getId().getValue()} has just connected from rtsp sender with rtsp stream url ${sfuRtspUrl}`);
            
    //         if (camera.getEventType() && camera.getEventType().getId()) {
    //             const streamHandler = newCameraStreamInfoHandler();  
    //             await streamHandler.createCameraStream(camera);
    
    //             // logger.info(`Camera with _id = ${camera.getId().getValue()} has just been added to AI server for detection`);    
    //         }
    //     }
    // }

    // async handleDeleteCameraStream(camera) {
    //     if (camera.getSfuRtspStreamUrl()) {
    //         const sfuHandler = newSfuRtspStreamHandler();
    //         await sfuHandler.disconnect(camera);

    //         // logger.info(`Camera with _id = ${camera.getId().getValue()} has just disconnected from rtsp sender with rtsp stream url ${sfuRtspUrl}`);
            
    //         if (camera.getEventType()) {
    //             const streamHandler = newCameraStreamInfoHandler();  
    //             await streamHandler.deleteCameraStreamById(camera.getId());

    //             // logger.info(`Camera with _id = ${camera.getId().getValue()} has just been deleted from AI server`);
    //         }
    //     }

    // }


    // async updateSfuRtspUrl(oldCamera, newCamera) {
    //     const handler = newSfuRtspStreamHandler();
    //     await handler.disconnect(oldCamera);
    //     const url = await handler.connect(newCamera);
    //     return url;
    // }

}



function newCameraService(repository=newCameraRepository()) {
    return new CameraService(repository);
}


module.exports.newCameraService = newCameraService;
