

const IotDeviceModel = require("../model/iot_device_model");
const { newIotDevice } = require("../entity/iot_device");
const { newFromDatabaseConverter } = require("../data_converter/from_database_converter");
const { newToDatabaseConverter } = require("../data_converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class IotDeviceRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }

    async getAll() {
        let iotDeviceDocs;
        try {
            iotDeviceDocs = await IotDeviceModel.find({});
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return iotDeviceDocs.map(iotDeviceDoc => {
            return this.fromDatabaseConverter.visit(newIotDevice(), iotDeviceDoc);
        })
    }
    
    async create(iotDeviceEntity) {
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
    
    async findById(iotDeviceId) {
        let iotDeviceDoc;
        iotDeviceId = iotDeviceId.getValue();
        try {
            iotDeviceDoc = await IotDeviceModel.findById(iotDeviceId).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newIotDevice(), iotDeviceDoc);
    }
    
    
    async findByName(iotDeviceName) {
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
    
    
    async findByIdAndUpdate(iotDeviceId, iotDeviceEntity) {
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

    async findByIdAndDelete(iotDeviceId) {
        const filter = {
            _id: iotDeviceId.getValue()
        }
        let deleteIotDeviceDoc;
        try {
            deleteIotDeviceDoc = await IotDeviceModel.findOneAndDelete(filter); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newIotDevice(), deleteIotDeviceDoc);
    }
}



function newIotDeviceRepository() {
    return new IotDeviceRepository();
}

module.exports.newIotDeviceRepository = newIotDeviceRepository;
