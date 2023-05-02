
const { newIotDeviceMapRepository } = require("../repository/iot_device_map_repository");

class IotDeviceMapService {
    constructor(repository=newIotDeviceMapRepository()) {
        this.repository = repository;
    }

    async getAllIotDeviceMaps() {
        const iotDeviceMaps = await this.repository.getAll();
        return iotDeviceMaps;
    }
    
    async createIotDeviceMap(iotDeviceMap) {
        const iotDeviceMapEntity = await this.repository.create(iotDeviceMap);
        return iotDeviceMapEntity; 
    }
    
    async findIotDeviceMapById(iotDeviceMapId) {
        const iotDeviceMapEntity = await this.repository.findById(iotDeviceMapId);
        return iotDeviceMapEntity;
    }
    
    async updateIotDeviceMapById(iotDeviceMapId, iotDeviceMapDetail) {
        const iotDeviceMapEntity = await this.repository.findByIdAndUpdate(iotDeviceMapId, iotDeviceMapDetail);
        return iotDeviceMapEntity;
    }


    async deleteIotDeviceMapById(iotDeviceMapId) {
        const iotDeviceMapEntity = await this.repository.findByIdAndDelete(iotDeviceMapId);
        return iotDeviceMapEntity;
    }

    async findIotDeviceMapByConnectIot(connectIotId) {
        const iotDeviceMapEntity = await this.repository.findByConnectIot(connectIotId);
        return iotDeviceMapEntity;
    }
}



function newIotDeviceMapService(repository=newIotDeviceMapRepository()) {
    return new IotDeviceMapService(repository);
}


module.exports.newIotDeviceMapService = newIotDeviceMapService;
