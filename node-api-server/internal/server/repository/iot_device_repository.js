

const IotDeviceModel = require("../model/iot_device_model");
const { newIotDevice } = require("../entity/iot_device");
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class IotDeviceRepository {
    constructor(fromDatabaseConverter=newFromDatabaseConverter(), toDatabaseConverter=newToDatabaseConverter()) {
        this.fromDatabaseConverter = fromDatabaseConverter;
        this.toDatabaseConverter = toDatabaseConverter;
    }
}

IotDeviceRepository.prototype.getAll = async function() {
    let iotDeviceDocs;
    try {
        iotDeviceDocs = await IotDeviceModel.find({});
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return iotDeviceDocs.map(iotDeviceDoc => {
        this.fromDatabaseConverter.visit(newIotDevice(), iotDeviceDoc);
    })
}

IotDeviceRepository.prototype.create = async function(iotDeviceEntity) {
    const iotDeviceDoc = this.toDatabaseConverter.visit(iotDeviceEntity);
    let newIotDeviceDoc;
    try {
        newIotDeviceDoc = await IotDeviceModel.create(iotDeviceDoc);
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return this.fromDatabaseConverter.visit(newIotDevice(), newIotDeviceDoc);
}

IotDeviceRepository.prototype.findById = async function(iotDeviceId) {
    let iotDeviceDoc;
    const iotDeviceId = iotDeviceId.getValue();
    try {
        iotDeviceDoc = await IotDeviceModel.findById(iotDeviceId).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    
    return this.fromDatabaseConverter.visit(newIotDevice(), iotDeviceDoc);
}


IotDeviceRepository.prototype.findByName = async function(iotDeviceName) {
    let iotDeviceDoc;

    try {
        iotDeviceDoc = await IotDeviceModel.findOne({
            iot_device_name: iotDeviceName
        }).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    
    return this.fromDatabaseConverter.visit(newIotDevice(), iotDeviceDoc);
}


IotDeviceRepository.prototype.findByIdAndUpdate = async function(iotDeviceId, iotDeviceEntity) {
    const iotDeviceDoc = this.toDatabaseConverter.visit(iotDeviceEntity);
    const filter = {
        _id: iotDeviceId.getValue()
    }
    let newIotDeviceDoc;
    try {
        newIotDeviceDoc = await IotDeviceModel.findOneAndUpdate(filter, iotDeviceDoc, { new: true }); // set new to true to return new document after update
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    return this.fromDatabaseConverter.visit(newIotDevice(), newIotDeviceDoc);
}

function newIotDeviceRepository() {
    return new IotDeviceRepository();
}

module.exports.newIotDeviceRepository = newIotDeviceRepository;
