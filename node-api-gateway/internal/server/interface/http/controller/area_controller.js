const { Controller } = require("./controller");
const { newAreaHandler } = require("../../../service/grpc_client/handler/area_handler");

class AreaController extends Controller {
    constructor(areaHandler=newAreaHandler()) {
        super();
        this.handler = areaHandler;
        
        this.getAllAreas = this.getAllAreas.bind(this);
        this.createArea = this.createArea.bind(this);
        this.getAreaById = this.getAreaById.bind(this);
        this.updateAreaById = this.updateAreaById.bind(this);
        this.deleteAreaById = this.deleteAreaById.bind(this);
    }

    getAllAreas(req, res, next) {
        let arg = {};
        if (req.query.type) {
            arg = {
                area_type: req.query.type
            }
            this.handler.getAllAreasByType(arg, this.success(res), this.failure(res));
        }
        else {
            this.handler.getAllAreas(arg, this.success(res), this.failure(res));
        }
    }
    
    createArea(req, res, next) {
        let arg = {
            area_detail: req.body
        };
        this.handler.createArea(arg, this.success(res), this.failure(res));
    }

    getAreaById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getAreaById(arg, this.success(res), this.failure(res));
    }

    updateAreaById(req, res, next) {
        let arg = {
            _id: req.params.id,
            area_detail: req.body
        };
        this.handler.updateAreaById(arg, this.success(res), this.failure(res));
    }

    deleteAreaById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteAreaById(arg, this.success(res), this.failure(res));
    }
}




function newAreaController() {
    return new AreaController();
}

module.exports.newAreaController = newAreaController;
