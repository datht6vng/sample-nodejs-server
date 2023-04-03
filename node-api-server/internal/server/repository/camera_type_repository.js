const CameraTypeModel = require("../model/camera_type_model");
const { newCameraType } = require("../entity/camera_type")
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class CameraTypeRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }

    async getAll() {
        let cameraTypeDocs;
        try {
            cameraTypeDocs = await CameraTypeModel.find({});
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return cameraTypeDocs.map(cameraTypeDoc => {
            return this.fromDatabaseConverter.visit(newCameraType(), cameraTypeDoc);
        })
    }

    async create(cameraTypeEntity) {
        const cameraTypeDoc = this.toDatabaseConverter.visit(cameraTypeEntity);
        let newCameraTypeDoc;
        try {
            newCameraTypeDoc = await CameraTypeModel.create(cameraTypeDoc);
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newCameraType(), newCameraTypeDoc);
    }

    async findById(cameraTypeId) {
        let cameraTypeDoc;
        cameraTypeId = cameraTypeId.getValue();
        try {
            cameraTypeDoc = await CameraTypeModel.findById(cameraTypeId).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newCameraType(), cameraTypeDoc);
    }

    async findByIdAndUpdate(cameraTypeId, cameraTypeEntity) {
        const cameraTypeDoc = this.toDatabaseConverter.visit(cameraTypeEntity);
        const filter = {
            _id: cameraTypeId.getValue()
        }
        let newCameraTypeDoc;
        try {
            newCameraTypeDoc = await CameraTypeModel.findOneAndUpdate(filter, cameraTypeDoc, { new: true }); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newCameraType(), newCameraTypeDoc);
    }

}


function newCameraTypeRepository() {
    return new CameraTypeRepository();
}

module.exports.newCameraTypeRepository = newCameraTypeRepository;
