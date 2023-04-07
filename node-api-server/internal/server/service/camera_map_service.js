
const { newCameraMapRepository } = require("../repository/camera_map_repository");

class CameraMapService {
    constructor(repository=newCameraMapRepository()) {
        this.repository = repository;
    }

    async getAllCameraMaps() {
        const cameraMaps = await this.repository.getAll();
        return cameraMaps;
    }
    
    async createCameraMap(cameraMap) {
        const cameraMapEntity = await this.repository.create(cameraMap);
        return cameraMapEntity; 
    }
    
    async findCameraMapById(cameraMapId) {
        const cameraMapEntity = await this.repository.findById(cameraMapId);
        return cameraMapEntity;
    }
    
    async updateCameraMapById(cameraMapId, cameraMapDetail) {
        const cameraMapEntity = await this.repository.findByIdAndUpdate(cameraMapId, cameraMapDetail);
        return cameraMapEntity;
    }


    async deleteCameraMapById(cameraMapId) {
        const cameraMapEntity = await this.repository.findByIdAndDelete(cameraMapId);
        return cameraMapEntity;
    }
}



function newCameraMapService(repository=newCameraMapRepository()) {
    return new CameraMapService(repository);
}


module.exports.newCameraMapService = newCameraMapService;
