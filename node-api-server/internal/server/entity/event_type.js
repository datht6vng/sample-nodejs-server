
class EventType {
    id = undefined;
    eventKey = undefined;
    eventName = undefined;
    eventDescription = undefined;



    accept(visitor, o, env) {
        return visitor.visitEventType(this, o, env);
    }
    
    getId() {
        return this.id;
    }
    
    getEventKey() {
        return this.eventKey;
    }   
    
    getEventName() {
        return this.eventName;
    }
    
    getEventDescription() {
        return this.eventDescription;
    }
    
    
    
    
    setId(id) {
        this.id = id;
        return this;
    }
    
    setEventKey(eventKey) {
        this.eventKey = eventKey;
        return this;
    }   
    
    setEventName(eventName) {
        this.eventName = eventName;
        return this;
    }
    
    setEventDescription(eventDescription) {
        this.eventDescription = eventDescription;
        return this;
    }
}




function newEventType() {
    return new EventType();
}

module.exports.newEventType = newEventType;
