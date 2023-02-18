

const AreaModel = require("../model/area_model");
const { newArea } = require("../entity/area");
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");
const { newNotFoundError } = require("../entity/error/not_found_error");


class AreaRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }
}

AreaRepository.prototype.getAll = async function() {
    let areaDocs;
    try {
        areaDocs = await AreaModel.find({});
    }
    catch(err) {
        throw newInternalServerError("Database error", "Database error occur");
    }
    return areaDocs.map(areaDoc => {
        this.fromDatabaseConverter.visit(newArea(), areaDoc);
    })
}

AreaRepository.prototype.create = async function(areaEntity) {
    const areaDoc = this.toDatabaseConverter.visit(areaEntity);
    let newDoc;
    try {
        newDoc = await AreaModel.create(areaDoc);
    }
    catch(err) {
        throw newInternalServerError("Database error", "Database error occur");
    }
    return this.fromDatabaseConverter.visit(newArea(), newDoc);
}

AreaRepository.prototype.findById = async function(id) {
    let areaDoc;
    try {
        areaDoc = await AreaModel.findById(areaId).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", "Database error occur");
    }
    const areaId = id.getValue();
    return this.fromDatabaseConverter.visit(new Area(), areaDoc);
}

AreaRepository.prototype.findByIdAndUpdate = async function(id, areaEntity) {
    const areaDoc = this.toDatabaseConverter.visit(areaEntity);
    const filter = {
        _id: id.getValue()
    }
    let newDoc;
    try {
        newDoc = await AreaModel.findOneAndUpdate(filter, areaDoc, { new: true }); // set new to true to return new document after update
    }
    catch(err) {
        throw newInternalServerError("Database error", "Database error occur");
    }
    return this.fromDatabaseConverter.visit(new Area(), newDoc);
}

function newAreaRepository() {
    return new AreaRepository();
}

module.exports.newAreaRepository = newAreaRepository


