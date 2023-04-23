
const { newIotDeviceTypeRepository } = require("../repository/iot_device_type_repository");

class IotDeviceTypeService {
    constructor(repository=newIotDeviceTypeRepository()) {
        this.repository = repository;
    }

    async getAllIotDeviceTypes() {
        const iotDeviceTypes = await this.repository.getAll();
        return iotDeviceTypes;
    }
    
    async createIotDeviceType(iotDeviceType) {
        const iotDeviceTypeEntity = await this.repository.create(iotDeviceType);
        return iotDeviceTypeEntity; 
    }
    
    async findIotDeviceTypeById(iotDeviceTypeId) {
        const iotDeviceTypeEntity = await this.repository.findById(iotDeviceTypeId);
        return iotDeviceTypeEntity;
    }
    
    async updateIotDeviceTypeById(iotDeviceTypeId, iotDeviceTypeDetail) {
        const iotDeviceTypeEntity = await this.repository.findByIdAndUpdate(iotDeviceTypeId, iotDeviceTypeDetail);
        return iotDeviceTypeEntity;
    }


    async deleteIotDeviceTypeById(iotDeviceTypeId) {
        const iotDeviceTypeEntity = await this.repository.findByIdAndDelete(iotDeviceTypeId);
        return iotDeviceTypeEntity;
    }
}



function newIotDeviceTypeService(repository=newIotDeviceTypeRepository()) {
    return new IotDeviceTypeService(repository);
}


module.exports.newIotDeviceTypeService = newIotDeviceTypeService;
