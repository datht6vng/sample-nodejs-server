const Event = require("../../../models/event");


class EventHandler {
    constructor() {

    }
}


EventHandler.prototype.getAllEvents = async function(_, callback) {
    let events = await Event.find().populate('iot_device_id').populate('area_id');
    console.log(events);
    let res = {
        events: events
    }
    callback(null, res);
}

EventHandler.prototype.getEvent = async function(req, callback) {
    let data = await Event.find(req.request).populate('iot_device_id').populate('area_id');
    callback(null, data);
}

module.exports.EventHandler = EventHandler;
