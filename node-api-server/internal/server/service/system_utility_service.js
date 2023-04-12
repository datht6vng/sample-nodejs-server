
const { newAreaRepository } = require("../repository/area_repository");
const { newIotDeviceMapRepository } = require("../repository/iot_device_map_repository");
const { newCameraMapRepository } = require("../repository/camera_map_repository");


class SystemUtilityService {
    constructor() {
        this.areaRepository = newAreaRepository();
        this.iotDeviceMapRepository = newIotDeviceMapRepository();
        this.cameraMapRepository = newCameraMapRepository();
    }

    async crudEntities(entities, repository) {
        let dict = {};
        entities.filter(entity => entity.getId())
            .forEach(entity => {
                dict[entity.getId().getValue()] = entity;
            });
        let dbEntities = await repository.getAll();

        let visitedIdValue = new Set();
        for (let entity of dbEntities) {
            const id = entity.getId();
            const idValue = id.getValue();
            if (!idValue in dict) {
                await repository.findByIdAndDelete(id);
            }
            else {
                visitedIdValue.add(idValue);
                await repository.findByIdAndUpdate(id, entity.setId(undefined));
                entity.setId(id);
            }
        }
        for (let entity of entities.filter(entity => !visitedIdValue.has(entity.getId().getValue()))) {
            await repository.create(entity);
        }
        return await repository.getAll();
    }

    async crudAllMapUtils(areas, cameraMaps, iotDeviceMaps) {
        areas = await this.crudEntities(areas, this.areaRepository);
        iotDeviceMaps = await this.crudEntities(iotDeviceMaps, this.iotDeviceMapRepository);
        cameraMaps = await this.crudEntities(cameraMaps, this.cameraMapRepository)
        return {
            areas: areas,
            iotDeviceMaps: iotDeviceMaps,
            cameraMaps: cameraMaps
        }
    }
}



function newSystemUtilityService() {
    return new SystemUtilityService();
}


module.exports.newSystemUtilityService = newSystemUtilityService;
