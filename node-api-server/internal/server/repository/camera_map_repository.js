const CameraMapModel = require("../model/camera_map_model");
const { newCameraMap } = require("../entity/camera_map")
const { newFromDatabaseConverter } = require("../data_converter/from_database_converter");
const { newToDatabaseConverter } = require("../data_converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class CameraMapRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }

    async getAll() {
        let cameraMapDocs;
        try {
            cameraMapDocs = await CameraMapModel.find({});
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return cameraMapDocs.map(cameraMapDoc => {
            return this.fromDatabaseConverter.visit(newCameraMap(), cameraMapDoc);
        })
    }

    async create(cameraMapEntity) {
        const cameraMapDoc = this.toDatabaseConverter.visit(cameraMapEntity);
        let newCameraMapDoc;
        try {
            newCameraMapDoc = await CameraMapModel.create(cameraMapDoc);
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newCameraMap(), newCameraMapDoc);
    }

    async findById(cameraMapId) {
        let cameraMapDoc;
        cameraMapId = cameraMapId.getValue();
        try {
            cameraMapDoc = await CameraMapModel.findById(cameraMapId).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newCameraMap(), cameraMapDoc);
    }

    async findByIdAndUpdate(cameraMapId, cameraMapEntity) {
        const cameraMapDoc = this.toDatabaseConverter.visit(cameraMapEntity);
        const filter = {
            _id: cameraMapId.getValue()
        }
        let newCameraMapDoc;
        try {
            newCameraMapDoc = await CameraMapModel.findOneAndUpdate(filter, cameraMapDoc, { new: true }); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newCameraMap(), newCameraMapDoc);
    }


    async findByIdAndDelete(cameraMapId) {
        const filter = {
            _id: cameraMapId.getValue()
        }
        let deleteCameraMapDoc;
        try {
            deleteCameraMapDoc = await CameraMapModel.findOneAndDelete(filter); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newCameraMap(), deleteCameraMapDoc);
    }

}


function newCameraMapRepository() {
    return new CameraMapRepository();
}

module.exports.newCameraMapRepository = newCameraMapRepository;


