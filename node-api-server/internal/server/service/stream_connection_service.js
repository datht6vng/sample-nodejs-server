const { logger } = require("../../../pkg/logger/logger");
const { newSfuRtspStreamHandler } = require("../grpc_client/handler/sfu_rtsp_stream_handler");
const { newCameraStreamInfoHandler } = require("../grpc_client/handler/camera_stream_info_handler");
const { newCamera } = require("../entity/camera");


USED_STATUS = "used";
FREE_STATUS = "free";

class StreamConnectionService {

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
            .setConnectToRtspSender(camera.getConnectToRtspSender())
            .setConnectToAi(camera.getConnectToAi())
        return state;
    }

    async handleCreateStream(camera, state=newCamera()) {
        this.setState(camera, state);
        if (this.satisfyRtspStream(camera) && this.inUsedStatus(camera)) {
            const rtspSenderHandler = newSfuRtspStreamHandler();
            const cameraStreamInfoHandler = newCameraStreamInfoHandler(); 
            const sfuRtspUrl = await rtspSenderHandler.connect(camera);

            camera.setSfuRtspStreamUrl("rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2");
            state.setSfuRtspStreamUrl("rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2");
            state.setConnectToRtspSender(true);
            if (camera.getEventType()) {
                await cameraStreamInfoHandler.createCameraStream(camera);
                state.setConnectToAi(true);
            }
        }
        return state;
    }

    async handleUpdateStream(oldCamera, updateCamera, state=newCamera()) {
        /*
            Pre: updatecamera must contain all information of the camera, not a part of it
        */
        this.setState(oldCamera, state);
        updateCamera.mergeCopy(oldCamera);

        if (oldCamera.getConnectToRtspSender() == true) {
            if (this.hasDifferentStreamInfo(oldCamera, updateCamera)) {
                await this.handleDeleteStream(oldCamera, state);
                await this.handleCreateStream(updateCamera, state);
            }
            else {
                const cameraStreamInfoHandler = newCameraStreamInfoHandler();
                if (oldCamera.getConnectToAi()) {
                    await cameraStreamInfoHandler.deleteCameraStreamById(oldCamera.getId()); 
                    state.setConnectToAi(false);
                }
                if (newCamera.getEventType()) {
                    await cameraStreamInfoHandler.createCameraStream(camera);
                    state.setConnectToAi(true);
                }
            }
        }
        else {
            await this.handleCreateStream(updateCamera, state);
        }
        return state;
    }

    async handleDeleteStream(camera, state=newCamera()) {
        this.setState(camera, state);
        const rtspSenderHandler = newSfuRtspStreamHandler();
        const cameraStreamInfoHandler = newCameraStreamInfoHandler();
        if (camera.getConnectToAi()) {
            await cameraStreamInfoHandler.deleteCameraStreamById(oldCamera.getId()); 
            state.setConnectToAi(false);
        }
        await rtspSenderHandler.disconnect(oldCamera);
        state.setConnectToRtspSender(false);
        return state;
    }
}

function newStreamConnectionService() {
    return new StreamConnectionService();
}

module.exports.newStreamConnectionService = newStreamConnectionService;
