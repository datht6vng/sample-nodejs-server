const IotDeviceTypeModel = require("../model/iot_device_type_model");
const { newIotDeviceType } = require("../entity/iot_device_type")
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class IotDeviceTypeRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }

    async getAll() {
        let iotDeviceTypeDocs;
        try {
            iotDeviceTypeDocs = await IotDeviceTypeModel.find({});
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return iotDeviceTypeDocs.map(iotDeviceTypeDoc => {
            return this.fromDatabaseConverter.visit(newIotDeviceType(), iotDeviceTypeDoc);
        })
    }

    async create(iotDeviceTypeEntity) {
        const iotDeviceTypeDoc = this.toDatabaseConverter.visit(iotDeviceTypeEntity);
        let newIotDeviceTypeDoc;
        try {
            newIotDeviceTypeDoc = await IotDeviceTypeModel.create(iotDeviceTypeDoc);
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newIotDeviceType(), newIotDeviceTypeDoc);
    }

    async findById(iotDeviceTypeId) {
        let iotDeviceTypeDoc;
        iotDeviceTypeId = iotDeviceTypeId.getValue();
        try {
            iotDeviceTypeDoc = await IotDeviceTypeModel.findById(iotDeviceTypeId).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newIotDeviceType(), iotDeviceTypeDoc);
    }

    async findByIdAndUpdate(iotDeviceTypeId, iotDeviceTypeEntity) {
        const iotDeviceTypeDoc = this.toDatabaseConverter.visit(iotDeviceTypeEntity);
        const filter = {
            _id: iotDeviceTypeId.getValue()
        }
        let newIotDeviceTypeDoc;
        try {
            newIotDeviceTypeDoc = await IotDeviceTypeModel.findOneAndUpdate(filter, iotDeviceTypeDoc, { new: true }); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newIotDeviceType(), newIotDeviceTypeDoc);
    }

}


function newIotDeviceTypeRepository() {
    return new IotDeviceTypeRepository();
}

module.exports.newIotDeviceTypeRepository = newIotDeviceTypeRepository;
