const { Controller } = require("./controller");
const { newIotDeviceTypeHandler } = require("../../../service/grpc_client/handler/iot_device_type_handler");

class IotDeviceTypeController extends Controller {
    constructor(iotDeviceTypeHandler=newIotDeviceTypeHandler()) {
        super();
        this.handler = iotDeviceTypeHandler;
        
        this.getAllIotDeviceTypes = this.getAllIotDeviceTypes.bind(this);
        this.createIotDeviceType = this.createIotDeviceType.bind(this);
        this.getIotDeviceTypeById = this.getIotDeviceTypeById.bind(this);
        this.updateIotDeviceTypeById = this.updateIotDeviceTypeById.bind(this);
        this.deleteIotDeviceTypeById = this.deleteIotDeviceTypeById.bind(this);
    }

    getAllIotDeviceTypes(req, res, next) {
        let arg = {};
        this.handler.getAllIotDeviceTypes(arg, this.success(res), this.failure(res));
    }
    
    createIotDeviceType(req, res, next) {
        let arg = {
            iot_device_type_detail: req.body
        };
        this.handler.createIotDeviceType(arg, this.success(res), this.failure(res));
    }

    getIotDeviceTypeById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getIotDeviceTypeById(arg, this.success(res), this.failure(res));
    }

    updateIotDeviceTypeById(req, res, next) {
        let arg = {
            _id: req.params.id,
            iot_device_type_detail: req.body
        };
        this.handler.updateIotDeviceTypeById(arg, this.success(res), this.failure(res));
    }

    deleteIotDeviceTypeById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteIotDeviceTypeById(arg, this.success(res), this.failure(res));
    }
}




function newIotDeviceTypeController() {
    return new IotDeviceTypeController();
}

module.exports.newIotDeviceTypeController = newIotDeviceTypeController;
