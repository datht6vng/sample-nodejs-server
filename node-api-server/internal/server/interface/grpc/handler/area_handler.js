const { newAreaService } = require("../../../service/area_service");

const { Handler } = require("./handler");

class AreaHandler extends Handler {
    constructor(service=newAreaService()) {
        super();
        this.service = service;
    }

    getAllAreas(call, callback) {
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
    
    createArea(call, callback) {
        const self = this;
        this.service.createArea(call.request.area_detail)
        .then(area => {
            self.success({
                area_detail: area
            }, callback)
        })
        .catch(err => {
            self.failure(err, callback);
        }) 
    
    }


    getAreaById(call, callback) {
        const self = this;
        this.service.findAreaById(call.request._id)
        .then(area => {
            self.success({
                area_detail: area
            }, callback)
        })
        .catch(err => {
            self.failure(err, callback);
        }) 
    
    }
    


    
    getAllAreasByType(call, callback) {
        const self = this;
        this.service.getAllAreasByType(call.request.area_type)
        .then(areas => {
            self.success({
                areas: areas
            }, callback)
        })
        .catch(err => {
            self.failure(err, callback);
        })
    
    }   
}


function newAreaHandler() {
    return new AreaHandler();
}

module.exports.newAreaHandler = newAreaHandler;
