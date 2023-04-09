const { Controller } = require("./controller");
const { newEventHandler } = require("../../../service/grpc_client/handler/event_handler");

class EventController extends Controller {
    constructor(eventHandler=newEventHandler()) {
        super();
        this.handler = eventHandler;
        
        this.getAllEvents = this.getAllEvents.bind(this);
        this.createEvent = this.createEvent.bind(this);
        this.getEventById = this.getEventById.bind(this);
        this.updateEventById = this.updateEventById.bind(this);
        this.deleteEventById = this.deleteEventById.bind(this);
    }

    getAllEvents(req, res, next) {
        let arg = {};
        this.handler.getAllEvents(arg, this.success(res), this.failure(res));
    }
    
    createEvent(req, res, next) {
        let arg = {
            event_detail: req.body
        };
        this.handler.createEvent(arg, this.success(res), this.failure(res));
    }

    getEventById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getEventById(arg, this.success(res), this.failure(res));
    }

    updateEventById(req, res, next) {
        let arg = {
            _id: req.params.id,
            event_detail: req.body
        };
        this.handler.updateEventById(arg, this.success(res), this.failure(res));
    }

    deleteEventById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteEventById(arg, this.success(res), this.failure(res));
    }
}




function newEventController() {
    return new EventController();
}

module.exports.newEventController = newEventController;
