

const AreaModel = require("../model/area_model");
const { newArea } = require("../entity/area");
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class AreaRepository {
    constructor(fromDatabaseConverter=newFromDatabaseConverter(), toDatabaseConverter=newToDatabaseConverter()) {
        this.fromDatabaseConverter = fromDatabaseConverter;
        this.toDatabaseConverter = toDatabaseConverter;
    }
}

AreaRepository.prototype.getAll = async function() {
    let areaDocs;
    try {
        areaDocs = await AreaModel.find({});
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return areaDocs.map(areaDoc => {
        return this.fromDatabaseConverter.visit(newArea(), areaDoc);
    })
}

AreaRepository.prototype.create = async function(areaEntity) {
    const areaDoc = this.toDatabaseConverter.visit(areaEntity);
    let newAreaDoc;
    try {
        newAreaDoc = await AreaModel.create(areaDoc);
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return this.fromDatabaseConverter.visit(newArea(), newAreaDoc);
}

AreaRepository.prototype.findById = async function(areaId) {
    let areaDoc;
    areaId = areaId.getValue();
    try {
        areaDoc = await AreaModel.findById(areaId).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    
    return this.fromDatabaseConverter.visit(newArea(), areaDoc);
}


AreaRepository.prototype.findByName = async function(areaName) {
    let areaDoc;

    try {
        areaDoc = await AreaModel.findOne({
            area_name: areaName
        }).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    
    return this.fromDatabaseConverter.visit(newArea(), areaDoc);
}


AreaRepository.prototype.findByIdAndUpdate = async function(areaId, areaEntity) {
    const areaDoc = this.toDatabaseConverter.visit(areaEntity);
    const filter = {
        _id: areaId.getValue()
    }
    let newAreaDoc;
    try {
        newAreaDoc = await AreaModel.findOneAndUpdate(filter, areaDoc, { new: true }); // set new to true to return new document after update
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return this.fromDatabaseConverter.visit(newArea(), newAreaDoc);
}

function newAreaRepository() {
    return new AreaRepository();
}

module.exports.newAreaRepository = newAreaRepository;


