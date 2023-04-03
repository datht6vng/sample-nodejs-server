

const EventModel = require("../model/event_model");
const { newEvent } = require("../entity/event");
const { newFromDatabaseConverter } = require("../util/converter/from_database_converter");
const { newToDatabaseConverter } = require("../util/converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class EventRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }



    async getAll() {
        let eventDocs;
        try {
            eventDocs = await EventModel.find({});
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return eventDocs.map(eventDoc => {
            return this.fromDatabaseConverter.visit(newEvent(), eventDoc);
        })
    }
    
    async create(eventEntity) {
        const eventDoc = this.toDatabaseConverter.visit(eventEntity);
        let newEventDoc;
        try {
            newEventDoc = await EventModel.create(eventDoc);
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newEvent(), newEventDoc);
    }
    
    async findById(eventId) {
        let eventDoc;
        const eventId = eventId.getValue();
        try {
            eventDoc = await EventModel.findById(eventId).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newEvent(), eventDoc);
    }
    
    async findByIdAndUpdate(eventId, eventEntity) {
        const eventDoc = this.toDatabaseConverter.visit(eventEntity);
        const filter = {
            _id: eventId.getValue()
        }
        let newEventDoc;
        try {
            newEventDoc = await EventModel.findOneAndUpdate(filter, eventDoc, { new: true }); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newEvent(), newEventDoc);
    }
}



function newEventRepository() {
    return new EventRepository();
}

module.exports.newEventRepository = newEventRepository;
