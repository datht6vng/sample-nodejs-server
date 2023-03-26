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


function newAreaRepository() {
    return new AreaRepository();
}

module.exports.newAreaRepository = newAreaRepository;


