
class EventType {
    id = undefined;
    eventKey = undefined;
    eventName = undefined;
    eventDescription = undefined;
}

EventType.prototype.accept = function(visitor, o, env) {
    return visitor.visitEventType(this, o, env);
}

EventType.prototype.getId = function() {
    return this.id;
}

EventType.prototype.getEventKey = function() {
    return this.eventKey;
}   

EventType.prototype.getEventName = function() {
    return this.eventName;
}

EventType.prototype.getEventDescription = function() {
    return this.eventDescription;
}




EventType.prototype.setId = function(id) {
    this.id = id;
    return this;
}

EventType.prototype.setEventKey = function(eventKey) {
    this.eventKey = eventKey;
    return this;
}   

EventType.prototype.setEventName = function(eventName) {
    this.eventName = eventName;
    return this;
}

EventType.prototype.setEventDescription = function(eventDescription) {
    this.eventDescription = eventDescription;
    return this;
}


function newEventType() {
    return new EventType();
}

module.exports.newEventType = newEventType;
