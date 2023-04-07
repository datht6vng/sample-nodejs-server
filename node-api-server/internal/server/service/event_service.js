
const { newEventRepository } = require("../repository/event_repository");

class EventService {
    constructor(repository=newEventRepository()) {
        this.repository = repository;
    }

    async getAllEvents() {
        const events = await this.repository.getAll();
        return events;
    }
    
    async createEvent(event) {
        const eventEntity = await this.repository.create(event);
        return eventEntity; 
    }
    
    async findEventById(eventId) {
        const eventEntity = await this.repository.findById(eventId);
        return eventEntity;
    }
    
    async updateEventById(eventId, eventDetail) {
        const eventEntity = await this.repository.findByIdAndUpdate(eventId, eventDetail);
        return eventEntity;
    }


    async deleteEventById(eventId) {
        const eventEntity = await this.repository.findByIdAndDelete(eventId);
        return eventEntity;
    }
}



function newEventService(repository=newEventRepository()) {
    return new EventService(repository);
}


module.exports.newEventService = newEventService;
