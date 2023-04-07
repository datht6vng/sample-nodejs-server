
const { newAreaRepository } = require("../repository/area_repository");

class AreaService {
    constructor(repository=newAreaRepository()) {
        this.repository = repository;
    }

    async getAllAreas() {
        const areas = await this.repository.getAll();
        return areas;
    }
    
    async createArea(area) {
        const areaEntity = await this.repository.create(area);
        return areaEntity; 
    }
    
    async findAreaById(areaId) {
        const areaEntity = await this.repository.findById(areaId);
        return areaEntity;
    }
    
    async updateAreaById(areaId, areaDetail) {
        const areaEntity = await this.repository.findByIdAndUpdate(areaId, areaDetail);
        return areaEntity;
    }


    async deleteAreaById(areaId) {
        const areaEntity = await this.repository.findByIdAndDelete(areaId);
        return areaEntity;
    }
    
    async getAllAreasByType(areaType) {
        const areas = await this.repository.findByType(areaType);
        return areas;
    }
}



function newAreaService(repository=newAreaRepository()) {
    return new AreaService(repository);
}


module.exports.newAreaService = newAreaService;
