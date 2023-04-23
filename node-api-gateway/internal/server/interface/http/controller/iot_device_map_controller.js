const { Controller } = require("./controller");
const { newIotDeviceMapHandler } = require("../../../service/grpc_client/handler/iot_device_map_handler");

class IotDeviceMapController extends Controller {
    constructor(iotDeviceMapHandler=newIotDeviceMapHandler()) {
        super();
        this.handler = iotDeviceMapHandler;
        
        this.getAllIotDeviceMaps = this.getAllIotDeviceMaps.bind(this);
        this.createIotDeviceMap = this.createIotDeviceMap.bind(this);
        this.getIotDeviceMapById = this.getIotDeviceMapById.bind(this);
        this.updateIotDeviceMapById = this.updateIotDeviceMapById.bind(this);
        this.deleteIotDeviceMapById = this.deleteIotDeviceMapById.bind(this);
    }

    getAllIotDeviceMaps(req, res, next) {
        let arg = {};
        this.handler.getAllIotDeviceMaps(arg, this.success(res), this.failure(res));
    }
    
    createIotDeviceMap(req, res, next) {
        let arg = {
            iot_device_map_detail: req.body
        };
        this.handler.createIotDeviceMap(arg, this.success(res), this.failure(res));
    }

    getIotDeviceMapById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getIotDeviceMapById(arg, this.success(res), this.failure(res));
    }

    updateIotDeviceMapById(req, res, next) {
        let arg = {
            _id: req.params.id,
            iot_device_map_detail: req.body
        };
        this.handler.updateIotDeviceMapById(arg, this.success(res), this.failure(res));
    }

    deleteIotDeviceMapById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteIotDeviceMapById(arg, this.success(res), this.failure(res));
    }
}




function newIotDeviceMapController() {
    return new IotDeviceMapController();
}

module.exports.newIotDeviceMapController = newIotDeviceMapController;
