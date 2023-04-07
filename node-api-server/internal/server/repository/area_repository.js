

const AreaModel = require("../model/area_model");
const { newArea } = require("../entity/area");
const { newFromDatabaseConverter } = require("../data_converter/from_database_converter");
const { newToDatabaseConverter } = require("../data_converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class AreaRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }

    async getAll() {
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


    async create(areaEntity) {
        const areaDoc = this.toDatabaseConverter.visit(areaEntity);
        let newAreaDoc;
        try {
            newAreaDoc = await AreaModel.create(areaDoc);
        }
        catch(err) {
            console.log(err)
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newArea(), newAreaDoc);
    }

    async findById(areaId) {
        let areaDoc;
        areaId = areaId.getValue();
        try {
            areaDoc = await AreaModel.findById(areaId).exec();
        }
        catch(err) {
            console.log(err)
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newArea(), areaDoc);
    }


    async findByType(areaType) {
        let areaDocs;
        try {
            areaDocs = await AreaModel.find({
                area_type: areaType 
            }).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return areaDocs.map(areaDoc => {
            return this.fromDatabaseConverter.visit(newArea(), areaDoc);
        })
    }

    async findByName(areaName) {
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

    async findByIdAndUpdate(areaId, areaEntity) {
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


    async findByIdAndDelete(areaId) {
        const filter = {
            _id: areaId.getValue()
        }
        let deleteAreaDoc;
        try {
            deleteAreaDoc = await AreaModel.findOneAndDelete(filter); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newArea(), deleteAreaDoc);
    }
}

function newAreaRepository() {
    return new AreaRepository();
}

module.exports.newAreaRepository = newAreaRepository;
