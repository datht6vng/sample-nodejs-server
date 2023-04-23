
const { newIotDeviceRepository } = require("../repository/iot_device_repository");

class IotDeviceService {
    constructor(repository=newIotDeviceRepository()) {
        this.repository = repository;
    }

    async getAllIotDevices() {
        const iotDevices = await this.repository.getAll();
        return iotDevices;
    }
    
    async createIotDevice(iotDevice) {
        const iotDeviceEntity = await this.repository.create(iotDevice);
        return iotDeviceEntity; 
    }
    
    async findIotDeviceById(iotDeviceId) {
        const iotDeviceEntity = await this.repository.findById(iotDeviceId);
        return iotDeviceEntity;
    }
    
    async updateIotDeviceById(iotDeviceId, iotDeviceDetail) {
        const iotDeviceEntity = await this.repository.findByIdAndUpdate(iotDeviceId, iotDeviceDetail);
        return iotDeviceEntity;
    }


    async deleteIotDeviceById(iotDeviceId) {
        const iotDeviceEntity = await this.repository.findByIdAndDelete(iotDeviceId);
        return iotDeviceEntity;
    }
}



function newIotDeviceService(repository=newIotDeviceRepository()) {
    return new IotDeviceService(repository);
}


module.exports.newIotDeviceService = newIotDeviceService;
