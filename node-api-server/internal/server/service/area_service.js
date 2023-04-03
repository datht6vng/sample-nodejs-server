
const { newArea } = require("../entity/area");
const { newId } = require("../entity/id");
const { newAreaRepository } = require("../repository/area_repository");
const { newFromProtobufConverter } = require("../util/converter/from_protobuf_converter");
const { newToProtobufConverter } = require("../util/converter/to_protobuf_converter");



class AreaService {
    constructor(repository=newAreaRepository()) {
        this.repository = repository;
        this.fromProtobufConverter = newFromProtobufConverter();
        this.toProtobufConverter = newToProtobufConverter();
    }

    async getAllAreas() {
        const areas = await this.repository.getAll();
        return areas.map(area => {
            return this.toProtobufConverter.visit(area);
        })
    }
    
    async createArea(area) {
        // console.log(this.fromProtobufConverter.visit(newArea(), area))
        const areaEntity = await this.repository.create(this.fromProtobufConverter.visit(newArea(), area));
        return this.toProtobufConverter.visit(areaEntity); 
    }
    
    async findAreaById(areaId) {
        const areaEntity = await this.repository.findById(newId(areaId));
        return this.toProtobufConverter.visit(areaEntity);
    }
    
    async findAreaByName(areaName) {
        const areaEntity = await this.repository.findByName(areaName);
        return this.toProtobufConverter.visit(areaEntity);
    }
    
    
    async updateAreaById(areaId, areaDetail) {
        const areaEntity = await this.repository.findByIdAndUpdate(newId(areaId), this.fromProtobufConverter.visit(newArea(), areaDetail));
        return this.toProtobufConverter.visit(areaEntity);
    }
    
    async getAllAreasByType(areaType) {
        const areas = await this.repository.findByType(areaType);
        return areas.map(area => {
            return this.toProtobufConverter.visit(area);
        })
    }
}



function newAreaService(repository=newAreaRepository()) {
    return new AreaService(repository);
}


module.exports.newAreaService = newAreaService;
