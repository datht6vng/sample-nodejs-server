const { Controller } = require("./controller");
const { newAreaService } = require("../../../service/grpc/area_service");

class AreaController extends Controller {
    constructor(areaService=newAreaService()) {
        super();
        this.service = areaService;
        
        this.getAllAreas = this.getAllAreas.bind(this);
    }
}

AreaController.prototype.getAllAreas = function(req, res, next) {
    console.log("req body get all: ", req.body)
    let arg = {};
    this.service.getAllAreas(arg, this.success(res), this.failure(res));
}

AreaController.prototype.getAllAreasByType = function(req, res, next) {
    console.log("req: ",  req.body)
    let arg = req.body;
    this.service.getAllAreasByType(arg, this.success(res), this.failure(res));
}

AreaController.prototype.createArea = function(req, res, next) {
    let arg = req.body;
    this.service.createArea(arg, this.success(res), this.failure(res));
}


function newAreaController() {
    return new AreaController();
}

module.exports.newAreaController = newAreaController;
