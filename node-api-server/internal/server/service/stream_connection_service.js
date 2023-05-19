const { newSfuRtspStreamHandler } = require("../grpc_client/handler/sfu_rtsp_stream_handler");
const { newCameraStreamInfoHandler } = require("../grpc_client/handler/camera_stream_info_handler");
const { newCamera } = require("../entity/camera");
const { newErrorHandler } = require("../error/error_handler");

USED_STATUS = "used";
FREE_STATUS = "free";

class StreamConnectionService {

    constructor() {
        this.errorHandler = newErrorHandler();
    }

    hasDifferentStreamInfo(oldCamera, newCamera) {
        return oldCamera.getRtspStreamUrl() != newCamera.getRtspStreamUrl() 
            || oldCamera.getUsername() != newCamera.getUsername()
            || oldCamera.getPassword() != newCamera.getPassword()
            || oldCamera.getStatus() != newCamera.getStatus();
    }

    satisfyRtspStream(camera) {
        return camera.getRtspStreamUrl() && camera.getUsername() && camera.getPassword();
    }

    inUsedStatus(camera) {
        return camera.getStatus() == USED_STATUS;
    }

    setState(camera, state) {
        state.setId(camera.getId())
            .setConnectToController(camera.getConnectToController())
            .setConnectToAi(camera.getConnectToAi())
        return state;
    }

    async handleCreateStream(camera, state=newCamera()) {
        // this.setState(camera, state);
        state.setId(camera.getId());
        if (this.satisfyRtspStream(camera) && this.inUsedStatus(camera)) {

            const ControllerHandler = newSfuRtspStreamHandler();
            const cameraStreamInfoHandler = newCameraStreamInfoHandler(); 
            const sfuRtspUrl = await ControllerHandler.connect(camera);

            // camera.setSfuRtspStreamUrl(sfuRtspUrl);
            // state.setSfuRtspStreamUrl(sfuRtspUrl);

            camera.setSfuRtspStreamUrl("rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2");
            state.setSfuRtspStreamUrl("rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2");
            
            state.setConnectToController(true);
            if (camera.getEventType()) {
                await cameraStreamInfoHandler.createCameraStream(camera);
                state.setConnectToAi(true);
            }
        }
        return state;
    }

    // async handleUpdateStream(oldCamera, updateCamera, state=newCamera()) {
    //     /*
    //         Pre: updatecamera must contain all information of the camera, not a part of it
    //     */
    //     this.setState(oldCamera, state);
    //     updateCamera.mergeCopy(oldCamera);

    //     if (oldCamera.getConnectToController() == true) {
    //         if (this.hasDifferentStreamInfo(oldCamera, updateCamera)) {
    //             await this.handleDeleteStream(oldCamera, state);
    //             await this.handleCreateStream(updateCamera, state);
    //         }
    //         else {
    //             const cameraStreamInfoHandler = newCameraStreamInfoHandler();
    //             if (oldCamera.getConnectToAi()) {
    //                 await cameraStreamInfoHandler.deleteCameraStreamById(oldCamera.getId()); 
    //                 state.setConnectToAi(false);
    //             }
    //             if (newCamera.getEventType()) {
    //                 await cameraStreamInfoHandler.createCameraStream(camera);
    //                 state.setConnectToAi(true);
    //             }
    //         }
    //     }
    //     else {
    //         await this.handleCreateStream(updateCamera, state);
    //     }
    //     return state;
    // }

    async handleDeleteStream(camera, state=newCamera()) {
        this.setState(camera, state);
        const ControllerHandler = newSfuRtspStreamHandler();
        const cameraStreamInfoHandler = newCameraStreamInfoHandler();
        if (camera.getConnectToAi()) {
            try {
                await cameraStreamInfoHandler.deleteCameraStreamById(camera.getId()); 
                state.setConnectToAi(false);    
            }
            catch(err) {
                this.errorHandler.execute(err);
            }
        }


        if (camera.getConnectToController()) {
            try {
                await ControllerHandler.disconnect(camera);
                state.setConnectToController(false); 
            }
            catch(err) {
                this.errorHandler.execute(err);
            }
        }

        state.setSfuRtspStreamUrl("");

        return state;
    }
}

function newStreamConnectionService() {
    return new StreamConnectionService();
}

module.exports.newStreamConnectionService = newStreamConnectionService;
