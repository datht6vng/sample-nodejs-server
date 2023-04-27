
const { newCameraRepository } = require("../repository/camera_repository");

class CameraStreamInfoService {
    constructor(repository=newCameraRepository()) {
        this.repository = repository;
    }

    async getAllCamerasWithEventType() {
        const cameras = await this.repository.getAllWithEventType();
        // filter object here
        return cameras;
    }
}



function newCameraStreamInfoService(repository=newCameraRepository()) {
    return new CameraStreamInfoService(repository);
}


module.exports.newCameraStreamInfoService = newCameraStreamInfoService;
