const { newEventService } = require("../../../service/event_service");
const { newEvent } = require("../../../entity/event");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class EventHandler extends Handler {
    constructor(service=newEventService()) {
        super();
        this.service = service;
    }

    getAllEvents(call, callback) {
        this.service.getAllEvents()
        .then(events => {
               
            events = events.map(event => {
                return this.toProtobufConverter.visit(event);
            })

            this.success({ 
                events: events 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createEvent(call, callback) {
        let event = this.fromProtobufConverter.visit(newEvent(), call.request.event_detail);
        this.service.createEvent(event)
        .then(event => {
            event = this.toProtobufConverter.visit(event);
            this.success({
                event_detail: event
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getEventById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findEventById(id)
        .then(event => {
            
            event = this.toProtobufConverter.visit(event);
            this.success({
                event_detail: event
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateEventById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let event = this.fromProtobufConverter.visit(newEvent(), call.request.event_detail);
        this.service.updateEventById(id, event)
        .then(event => {
            
            event = this.toProtobufConverter.visit(event);
            this.success({
                event_detail: event
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteEventById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteEventById(id)
        .then(event => {
            
            event = this.toProtobufConverter.visit(event);
            this.success({
                event_detail: event
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newEventHandler() {
    return new EventHandler();
}

module.exports.newEventHandler = newEventHandler;
