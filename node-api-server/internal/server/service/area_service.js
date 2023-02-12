
const { newArea } = require("../entity/area");
const { newAreaRepository } = require("../repository/area_repository");
const { newFromProtobufConverter } = require("../util/converter/from_protobuf_converter");
const { newToProtobufConverter } = require("../util/converter/to_protobuf_converter");



class AreaService {
    constructor(repository=newAreaRepository()) {
        this.repository = repository;
        this.fromProtobufConverter = newFromProtobufConverter();
        this.toProtobufConverter = newToProtobufConverter();
    }
}

AreaService.prototype.getAllAreas = async function() {
    const areas = await this.repository.getAllAreas();
    return areas.map(area => {
        this.toProtobufConverter.visit(newArea(), area);
    })
}

AreaService.prototype.createArea = async function(area) {
    console.log(this.fromProtobufConverter.visit(newArea(), area))
    const areaEntity = await this.repository.createArea(this.fromProtobufConverter.visit(newArea(), area));
    return this.toProtobufConverter.visit(areaEntity); 
}

function newAreaService(repository=newAreaRepository()) {
    return new AreaService(repository);
}


module.exports.newAreaService = newAreaService;
