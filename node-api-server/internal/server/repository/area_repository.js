

const AreaModel = require("../model/area_model");
const { newArea } = require("../entity/area");
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class AreaRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }
}

AreaRepository.prototype.getAllAreas = async function() {
    let areas;
    try {
        areas = await AreaModel.find({});
    }
    catch(err) {
        throw newInternalServerError("Database error", "Database error occur");
    }
    return areas.map(area => {
        this.fromDatabaseConverter.visit(newArea(), area);
    })
}



AreaRepository.prototype.createArea = async function(area) {
    const areaData = this.toDatabaseConverter.visit(area);
    let doc;
    try {
        doc = await AreaModel.create(areaData);
    }
    catch(err) {
        throw newInternalServerError("Database error", "Database error occur");
    }
    return this.fromDatabaseConverter.visit(newArea(), doc);
}



AreaRepository.prototype.findAreaById = async function(id) {
    try {
        const areaId = id.getValue();
        const area = await AreaModel.findById(areaId).exec();
        return this.fromDatabaseConverter.visit(new Area(), area);
    }
    catch(err) {
        console.log(err);
    }



}

function newAreaRepository() {
    return new AreaRepository();
}

module.exports.newAreaRepository = newAreaRepository


