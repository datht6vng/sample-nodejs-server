
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

function newAreaService(repository=newAreaRepository()) {
    return new AreaService(repository);
}


module.exports.newAreaService = newAreaService;
