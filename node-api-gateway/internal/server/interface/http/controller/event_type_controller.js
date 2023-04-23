const { Controller } = require("./controller");
const { newEventTypeHandler } = require("../../../service/grpc_client/handler/event_type_handler");

class EventTypeController extends Controller {
    constructor(eventTypeHandler=newEventTypeHandler()) {
        super();
        this.handler = eventTypeHandler;
        
        this.getAllEventTypes = this.getAllEventTypes.bind(this);
        this.createEventType = this.createEventType.bind(this);
        this.getEventTypeById = this.getEventTypeById.bind(this);
        this.updateEventTypeById = this.updateEventTypeById.bind(this);
        this.deleteEventTypeById = this.deleteEventTypeById.bind(this);
    }

    getAllEventTypes(req, res, next) {
        let arg = {};
        this.handler.getAllEventTypes(arg, this.success(res), this.failure(res));
    }
    
    createEventType(req, res, next) {
        let arg = {
            event_type_detail: req.body
        };
        this.handler.createEventType(arg, this.success(res), this.failure(res));
    }

    getEventTypeById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getEventTypeById(arg, this.success(res), this.failure(res));
    }

    updateEventTypeById(req, res, next) {
        let arg = {
            _id: req.params.id,
            event_type_detail: req.body
        };
        this.handler.updateEventTypeById(arg, this.success(res), this.failure(res));
    }

    deleteEventTypeById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteEventTypeById(arg, this.success(res), this.failure(res));
    }
}




function newEventTypeController() {
    return new EventTypeController();
}

module.exports.newEventTypeController = newEventTypeController;
