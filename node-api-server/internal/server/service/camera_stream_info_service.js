
const { newCameraRepository } = require("../repository/camera_repository");

class CameraStreamInfoService {
    constructor(repository=newCameraRepository()) {
        this.repository = repository;
    }

    async getAllCamerasWithEventType() {
        const cameras = await this.repository.getAllWithEventType();
        let result = new Array();
        // filter object here
        for (let camera of cameras) {
            if (camera.getSfuRtspStreamUrl() && camera.getEventType() && camera.getEventType().getId()) {
                result.push(camera);
            }
        }
        return result;
    }
}



function newCameraStreamInfoService(repository=newCameraRepository()) {
    return new CameraStreamInfoService(repository);
}


module.exports.newCameraStreamInfoService = newCameraStreamInfoService;
