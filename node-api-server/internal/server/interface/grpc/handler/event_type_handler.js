const { newEventTypeService } = require("../../../service/event_type_service");
const { newEventType } = require("../../../entity/event_type");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class EventTypeHandler extends Handler {
    constructor(service=newEventTypeService()) {
        super();
        this.service = service;
    }

    getAllEventTypes(call, callback) {
        this.service.getAllEventTypes()
        .then(eventTypes => {
               
            eventTypes = eventTypes.map(eventType => {
                return this.toProtobufConverter.visit(eventType);
            })

            this.success({ 
                event_types: eventTypes 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createEventType(call, callback) {
        let eventType = this.fromProtobufConverter.visit(newEventType(), call.request.event_type_detail);
        this.service.createEventType(eventType)
        .then(eventType => {
            eventType = this.toProtobufConverter.visit(eventType);
            this.success({
                event_type_detail: eventType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getEventTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findEventTypeById(id)
        .then(eventType => {
            
            eventType = this.toProtobufConverter.visit(eventType);
            this.success({
                event_type_detail: eventType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateEventTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let eventType = this.fromProtobufConverter.visit(newEventType(), call.request.event_type_detail);
        this.service.updateEventTypeById(id, eventType)
        .then(eventType => {
            
            eventType = this.toProtobufConverter.visit(eventType);
            this.success({
                event_type_detail: eventType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteEventTypeById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteEventTypeById(id)
        .then(eventType => {
            
            eventType = this.toProtobufConverter.visit(eventType);
            this.success({
                event_type_detail: eventType
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newEventTypeHandler() {
    return new EventTypeHandler();
}

module.exports.newEventTypeHandler = newEventTypeHandler;
