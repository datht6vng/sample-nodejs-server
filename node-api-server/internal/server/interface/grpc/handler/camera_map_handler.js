const { newAreaService } = require("../../../service/area_service");

const { Handler } = require("./handler");

class AreaHandler extends Handler {
    constructor(service=newAreaService()) {
        super();
        this.service = service;
    }
}

AreaHandler.prototype.getAllAreas = function(call, callback) {
    const self = this;
    this.service.getAllAreas()
    .then(areas => {
        self.success({ 
            areas: areas 
        }, callback);
    })
    .catch(err => {
        self.failure(err, callback);
    })
}

function newAreaHandler() {
    return new AreaHandler();
}

module.exports.newAreaHandler = newAreaHandler;
