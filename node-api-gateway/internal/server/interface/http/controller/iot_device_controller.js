const { Controller } = require("./controller");
const { newIotDeviceHandler } = require("../../../service/grpc_client/handler/iot_device_handler");

class IotDeviceController extends Controller {
    constructor(iotDeviceHandler=newIotDeviceHandler()) {
        super();
        this.handler = iotDeviceHandler;
        
        this.getAllIotDevices = this.getAllIotDevices.bind(this);
        this.createIotDevice = this.createIotDevice.bind(this);
        this.getIotDeviceById = this.getIotDeviceById.bind(this);
        this.updateIotDeviceById = this.updateIotDeviceById.bind(this);
        this.deleteIotDeviceById = this.deleteIotDeviceById.bind(this);
    }

    getAllIotDevices(req, res, next) {
        let arg = {};
        this.handler.getAllIotDevices(arg, this.success(res), this.failure(res));
    }
    
    createIotDevice(req, res, next) {
        let arg = {
            iot_device_detail: req.body
        };
        this.handler.createIotDevice(arg, this.success(res), this.failure(res));
    }

    getIotDeviceById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getIotDeviceById(arg, this.success(res), this.failure(res));
    }

    updateIotDeviceById(req, res, next) {
        let arg = {
            _id: req.params.id,
            iot_device_detail: req.body
        };
        this.handler.updateIotDeviceById(arg, this.success(res), this.failure(res));
    }

    deleteIotDeviceById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteIotDeviceById(arg, this.success(res), this.failure(res));
    }
}




function newIotDeviceController() {
    return new IotDeviceController();
}

module.exports.newIotDeviceController = newIotDeviceController;
