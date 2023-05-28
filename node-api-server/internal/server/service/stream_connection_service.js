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

    createRelayStreamUrl(rtspStreamUrl, username, password) {
        const arr = rtspStreamUrl.split("//");
        return `${arr[0]}//${username}:${password}@${arr[1]}`;
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

            const rtspSenderHandler = newSfuRtspStreamHandler();
            const cameraStreamInfoHandler = newCameraStreamInfoHandler();
            try {
                state.setConnectToController(true);
                await rtspSenderHandler.connect(camera);
            }
            catch(err) {
                this.errorHandler.execute(err);
            } 
            

            // camera.setSfuRtspStreamUrl(sfuRtspUrl);
            // state.setSfuRtspStreamUrl(sfuRtspUrl);
            

            // camera.setSfuRtspStreamUrl("rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2");
            // state.setSfuRtspStreamUrl("rtsp://admin:Dientoan@123@tris.ddns.net:5564/Streaming/Channels/102?transportmode=unicast&profile=Profile_2");

            const relayStreamUrl = this.createRelayStreamUrl(camera.getRtspStreamUrl(), camera.getUsername(), camera.getPassword());
            camera.setSfuRtspStreamUrl(relayStreamUrl);
            state.setSfuRtspStreamUrl(relayStreamUrl);


            
            if (camera.getEventType()) {
                try {
                    state.setConnectToAi(true);
                    await cameraStreamInfoHandler.createCameraStream(camera);
                }
                catch(err) {
                    this.errorHandler.execute(err);
                }

            }
        }
        return state;
    }

    async handleDeleteStream(camera, state=newCamera()) {
        this.setState(camera, state);
        const rtspSenderHandler = newSfuRtspStreamHandler();
        const cameraStreamInfoHandler = newCameraStreamInfoHandler();


        try {
            state.setConnectToAi(false);
            await cameraStreamInfoHandler.deleteCameraStreamById(camera.getId()); 
        }
        catch(err) {
            this.errorHandler.execute(err);
        }

        // if (camera.getConnectToAi()) {
        //     try {
        //         state.setConnectToAi(false);
        //         await cameraStreamInfoHandler.deleteCameraStreamById(camera.getId()); 
        //     }
        //     catch(err) {
        //         this.errorHandler.execute(err);
        //     }
        // }


        try {
            state.setConnectToController(false);
            await rtspSenderHandler.disconnect(camera);
        }
        catch(err) {
            this.errorHandler.execute(err);
        }

        // if (camera.getConnectToRtspSender()) {
        //     try {
        //         state.setConnectToRtspSender(false);
        //         await rtspSenderHandler.disconnect(camera);
        //     }
        //     catch(err) {
        //         this.errorHandler.execute(err);
        //     }
        // }


        state.setSfuRtspStreamUrl("");

        return state;
    }
}

function newStreamConnectionService() {
    return new StreamConnectionService();
}

module.exports.newStreamConnectionService = newStreamConnectionService;
