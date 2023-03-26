
const { newArea } = require("../entity/area");
const { newId } = require("../entity/id");
const { newAreaRepository } = require("../repository/area_repository");
const { newFromProtobufConverter } = require("../util/converter/from_protobuf_converter");
const { newToProtobufConverter } = require("../util/converter/to_protobuf_converter");



class AreaService {
    constructor(repository=newAreaRepository(), fromProtobufConverter=newFromProtobufConverter(), toProtobufConverter=newToProtobufConverter()) {
        this.repository = repository;
        this.fromProtobufConverter = fromProtobufConverter;
        this.toProtobufConverter = toProtobufConverter;
    }
}

AreaService.prototype.getAllAreas = async function() {
    const areas = await this.repository.getAll();
    return areas.map(area => {
        return this.toProtobufConverter.visit(area);
    })
}

AreaService.prototype.createArea = async function(area) {
    // console.log(this.fromProtobufConverter.visit(newArea(), area))
    const areaEntity = await this.repository.create(this.fromProtobufConverter.visit(newArea(), area));
    return this.toProtobufConverter.visit(areaEntity); 
}

AreaService.prototype.findAreaById = async function(areaId) {
    const areaEntity = await this.repository.findById(newId(areaId));
    return this.toProtobufConverter.visit(areaEntity);
}

AreaService.prototype.findAreaByName = async function(areaName) {
    const areaEntity = await this.repository.findByName(areaName);
    return this.toProtobufConverter.visit(areaEntity);
}


AreaService.prototype.updateAreaById = async function(areaId, areaDetail) {
    const areaEntity = await this.repository.findByIdAndUpdate(newId(areaId), this.fromProtobufConverter.visit(newArea(), areaDetail));
    return this.toProtobufConverter.visit(areaEntity);
}

AreaService.prototype.getAllAreasByType = async function(areaType) {
    const areaEntity = await this.repository.findByType(areaType);
    return this.toProtobufConverter.visit(areaEntity);
}

function newAreaService(repository=newAreaRepository()) {
    return new AreaService(repository);
}


module.exports.newAreaService = newAreaService;
