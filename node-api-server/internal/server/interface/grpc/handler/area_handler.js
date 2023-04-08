const { newAreaService } = require("../../../service/area_service");
const { newArea } = require("../../../entity/area");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class AreaHandler extends Handler {
    constructor(service=newAreaService()) {
        super();
        this.service = service;
    }

    getAllAreas(call, callback) {
        this.service.getAllAreas()
        .then(areas => {
               
            areas = areas.map(area => {
                return this.toProtobufConverter.visit(area);
            })

            this.success({ 
                areas: areas 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createArea(call, callback) {
        let area = this.fromProtobufConverter.visit(newArea(), call.request.area_detail);
        this.service.createArea(area)
        .then(area => {
            area = this.toProtobufConverter.visit(area);
            this.success({
                area_detail: area
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getAreaById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findAreaById(id)
        .then(area => {
            
            area = this.toProtobufConverter.visit(area);
            this.success({
                area_detail: area
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }
    
    getAllAreasByType(call, callback) {
        this.service.getAllAreasByType(call.request.area_type)
        .then(areas => {
            areas = areas.map(area => {
                return this.toProtobufConverter.visit(area);
            })
            this.success({
                areas: areas
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    
    }
    
    

    updateAreaById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let area = this.fromProtobufConverter.visit(newArea(), call.request.area_detail);
        this.service.updateAreaById(id, area)
        .then(area => {
            
            area = this.toProtobufConverter.visit(area);
            this.success({
                area_detail: area
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteAreaById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteAreaById(id)
        .then(area => {
            
            area = this.toProtobufConverter.visit(area);
            this.success({
                area_detail: area
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newAreaHandler() {
    return new AreaHandler();
}

module.exports.newAreaHandler = newAreaHandler;
