

const EventTypeModel = require("../model/event_type_model");
const { newEventType } = require("../entity/event_type");
const { newFromDatabaseConverter } = require("../data_converter/from_database_converter");
const { newToDatabaseConverter } = require("../data_converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class EventTypeRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }


    async getAll() {
        let eventTypeDocs;
        try {
            eventTypeDocs = await EventTypeModel.find({});
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return eventTypeDocs.map(eventTypeDoc => {
            this.fromDatabaseConverter.visit(newEventType(), eventTypeDoc);
        })
    }
    
    async create(eventTypeEntity) {
        const eventTypeDoc = this.toDatabaseConverter.visit(eventTypeEntity);
        let newEventTypeDoc;
        try {
            newEventTypeDoc = await EventTypeModel.create(eventTypeDoc);
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newEventType(), newEventTypeDoc);
    }
    
    async findById(eventTypeId) {
        let eventTypeDoc;
        eventTypeId = eventTypeId.getValue();
        try {
            eventTypeDoc = await EventTypeModel.findById(eventTypeId).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newEventType(), eventTypeDoc);
    }
    
    
    async findByName(eventTypeName) {
        let eventTypeDoc;
    
        try {
            eventTypeDoc = await EventTypeModel.findOne({
                event_name: eventTypeName
            }).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newEventType(), eventTypeDoc);
    }
    
    
    async findByIdAndUpdate(eventTypeId, eventTypeEntity) {
        const eventTypeDoc = this.toDatabaseConverter.visit(eventTypeEntity);
        const filter = {
            _id: eventTypeId.getValue()
        }
        let newEventTypeDoc;
        try {
            newEventTypeDoc = await EventTypeModel.findOneAndUpdate(filter, eventTypeDoc, { new: true }); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newEventType(), newEventTypeDoc);
    }
    
    async findByIdAndDelete(eventTypeId) {
        const filter = {
            _id: eventTypeId.getValue()
        }
        let deleteEventTypeDoc;
        try {
            deleteEventTypeDoc = await EventTypeModel.findOneAndDelete(filter); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newEventType(), deleteEventTypeDoc);
    }
}


function newEventTypeRepository() {
    return new EventTypeRepository();
}

module.exports.newEventTypeRepository = newEventTypeRepository;
