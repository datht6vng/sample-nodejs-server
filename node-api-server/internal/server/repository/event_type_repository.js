

const EventTypeModel = require("../model/event_type_model");
const { newEventType } = require("../entity/event_type");
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class EventTypeRepository {
    constructor(fromDatabaseConverter=newFromDatabaseConverter(), toDatabaseConverter=newToDatabaseConverter()) {
        this.fromDatabaseConverter = fromDatabaseConverter;
        this.toDatabaseConverter = toDatabaseConverter;
    }
}

EventTypeRepository.prototype.getAll = async function() {
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

EventTypeRepository.prototype.create = async function(eventTypeEntity) {
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

EventTypeRepository.prototype.findById = async function(eventTypeId) {
    let eventTypeDoc;
    const eventTypeId = eventTypeId.getValue();
    try {
        eventTypeDoc = await EventTypeModel.findById(eventTypeId).exec();
    }
    catch(err) {
        throw newInternalServerError("Database error", err);
    }
    
    return this.fromDatabaseConverter.visit(newEventType(), eventTypeDoc);
}


EventTypeRepository.prototype.findByName = async function(eventTypeName) {
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


EventTypeRepository.prototype.findByIdAndUpdate = async function(eventTypeId, eventTypeEntity) {
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

function newEventTypeRepository() {
    return new EventTypeRepository();
}

module.exports.newEventTypeRepository = newEventTypeRepository;
