const { Controller } = require("./controller");
const { newSystemUtilityHandler } = require("../../../service/grpc_client/handler/system_utility_handler");

class SystemUtilityController extends Controller {
    constructor(systemUtilityHandler=newSystemUtilityHandler()) {
        super();
        this.handler = systemUtilityHandler;
        
        this.crudAllMapUtils = this.crudAllMapUtils.bind(this);
    }

    crudAllMapUtils(req, res, next) {
        let arg = req.body;
        this.handler.crudAllMapUtils(arg, this.success(res), this.failure(res));
    }
}

function newSystemUtilityController() {
    return new SystemUtilityController();
}

module.exports.newSystemUtilityController = newSystemUtilityController;
