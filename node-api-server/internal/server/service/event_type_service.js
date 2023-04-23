
const { newEventTypeRepository } = require("../repository/event_type_repository");

class EventTypeService {
    constructor(repository=newEventTypeRepository()) {
        this.repository = repository;
    }

    async getAllEventTypes() {
        const eventTypes = await this.repository.getAll();
        return eventTypes;
    }
    
    async createEventType(eventType) {
        const eventTypeEntity = await this.repository.create(eventType);
        return eventTypeEntity; 
    }
    
    async findEventTypeById(eventTypeId) {
        const eventTypeEntity = await this.repository.findById(eventTypeId);
        return eventTypeEntity;
    }
    
    async updateEventTypeById(eventTypeId, eventTypeDetail) {
        const eventTypeEntity = await this.repository.findByIdAndUpdate(eventTypeId, eventTypeDetail);
        return eventTypeEntity;
    }


    async deleteEventTypeById(eventTypeId) {
        const eventTypeEntity = await this.repository.findByIdAndDelete(eventTypeId);
        return eventTypeEntity;
    }
}



function newEventTypeService(repository=newEventTypeRepository()) {
    return new EventTypeService(repository);
}


module.exports.newEventTypeService = newEventTypeService;
