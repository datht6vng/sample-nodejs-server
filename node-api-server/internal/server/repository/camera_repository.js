

const CameraModel = require("../model/camera_model");
const { newCamera } = require("../entity/camera");
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class CameraRepository {
    constructor(fromDatabaseConverter=newFromDatabaseConverter(), toDatabaseConverter=newToDatabaseConverter()) {
        this.fromDatabaseConverter = fromDatabaseConverter;
        this.toDatabaseConverter = toDatabaseConverter;
    }
}

CameraRepository.prototype.getAll = async function() {
    let cameraDocs;
    try {
        cameraDocs = await CameraModel.find({});
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return cameraDocs.map(cameraDoc => {
        return this.fromDatabaseConverter.visit(newCamera(), cameraDoc);
    })
}

CameraRepository.prototype.create = async function(cameraEntity) {
    const cameraDoc = this.toDatabaseConverter.visit(cameraEntity);
    let newCameraDoc;
    try {
        newCameraDoc = await CameraModel.create(cameraDoc);
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return this.fromDatabaseConverter.visit(newCamera(), newCameraDoc);
}

CameraRepository.prototype.findById = async function(cameraId) {
    let cameraDoc;
    const cameraId = cameraId.getValue();
    try {
        cameraDoc = await CameraModel.findById(cameraId).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    
    return this.fromDatabaseConverter.visit(newCamera(), cameraDoc);
}


CameraRepository.prototype.findByName = async function(cameraName) {
    let cameraDoc;

    try {
        cameraDoc = await CameraModel.findOne({
            camera_name: cameraName
        }).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    
    return this.fromDatabaseConverter.visit(newCamera(), cameraDoc);
}


CameraRepository.prototype.findByIdAndUpdate = async function(cameraId, cameraEntity) {
    const cameraDoc = this.toDatabaseConverter.visit(cameraEntity);
    const filter = {
        _id: cameraId.getValue()
    }
    let newCameraDoc;
    try {
        newCameraDoc = await CameraModel.findOneAndUpdate(filter, cameraDoc, { new: true }); // set new to true to return new document after update
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return this.fromDatabaseConverter.visit(newCamera(), newCameraDoc);
}

function newCameraRepository() {
    return new CameraRepository();
}

module.exports.newCameraRepository = newCameraRepository;
