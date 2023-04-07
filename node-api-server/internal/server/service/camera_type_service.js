
const { newCameraTypeRepository } = require("../repository/camera_type_repository");

class CameraTypeService {
    constructor(repository=newCameraTypeRepository()) {
        this.repository = repository;
    }

    async getAllCameraTypes() {
        const cameraTypes = await this.repository.getAll();
        return cameraTypes;
    }
    
    async createCameraType(cameraType) {
        const cameraTypeEntity = await this.repository.create(cameraType);
        return cameraTypeEntity; 
    }
    
    async findCameraTypeById(cameraTypeId) {
        const cameraTypeEntity = await this.repository.findById(cameraTypeId);
        return cameraTypeEntity;
    }
    
    async updateCameraTypeById(cameraTypeId, cameraTypeDetail) {
        const cameraTypeEntity = await this.repository.findByIdAndUpdate(cameraTypeId, cameraTypeDetail);
        return cameraTypeEntity;
    }


    async deleteCameraTypeById(cameraTypeId) {
        const cameraTypeEntity = await this.repository.findByIdAndDelete(cameraTypeId);
        return cameraTypeEntity;
    }
}



function newCameraTypeService(repository=newCameraTypeRepository()) {
    return new CameraTypeService(repository);
}


module.exports.newCameraTypeService = newCameraTypeService;
