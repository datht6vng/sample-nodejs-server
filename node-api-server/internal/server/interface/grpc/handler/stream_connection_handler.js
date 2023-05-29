const { newStreamConnectionService } = require("../../../service/stream_connection_service");
const { newCameraService } = require("../../../service/camera_service");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class StreamConnectionHandler extends Handler {
    constructor(service=newStreamConnectionService()) {
        super();    
        this.service = service;
        this.cameraService = newCameraService();
    }

    async forceConnect(call, callback) {
        try {
            const request = call.request;
            const camera = await this.cameraService.findCameraById(newId(request.clientID), true);
            await this.service.handleCreateStream(camera);
            this.success({}, callback);
        }
        catch(err) {
            this.failure(err, callback);
        }


    }

    async forceDisconnect(call, callback) {
        try {
            const request = call.request;
            const camera = await this.cameraService.findCameraById(newId(request.clientID), true);
            await this.service.handleDeleteStream(camera);
            this.success({}, callback);
        }
        catch(err) {
            this.failure(err, callback);
        }
    }
}


function newStreamConnectionHandler() {
    return new StreamConnectionHandler();
}

module.exports.newStreamConnectionHandler = newStreamConnectionHandler;
