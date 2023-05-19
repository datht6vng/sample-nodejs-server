
const { newCameraRepository } = require("../repository/camera_repository");

class CameraStreamInfoService {
    constructor(repository=newCameraRepository()) {
        this.repository = repository;
    }

    statisfyAiCondition(camera) {
        return camera.getSfuRtspStreamUrl() && camera.getEventType() && camera.getEventType().getId() && camera.getStatus() == "used";
    }

    async getAllCamerasWithEventType() {
        const cameras = await this.repository.getAllWithEventType();
        let result = new Array();
        // filter object here
        for (let camera of cameras) {
            if (this.statisfyAiCondition(camera)) {
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
