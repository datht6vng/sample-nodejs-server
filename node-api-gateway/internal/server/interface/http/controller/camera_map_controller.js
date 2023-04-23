const { Controller } = require("./controller");
const { newCameraMapHandler } = require("../../../service/grpc_client/handler/camera_map_handler");

class CameraMapController extends Controller {
    constructor(cameraMapHandler=newCameraMapHandler()) {
        super();
        this.handler = cameraMapHandler;
        
        this.getAllCameraMaps = this.getAllCameraMaps.bind(this);
        this.createCameraMap = this.createCameraMap.bind(this);
        this.getCameraMapById = this.getCameraMapById.bind(this);
        this.updateCameraMapById = this.updateCameraMapById.bind(this);
        this.deleteCameraMapById = this.deleteCameraMapById.bind(this);
    }

    getAllCameraMaps(req, res, next) {
        let arg = {};
        this.handler.getAllCameraMaps(arg, this.success(res), this.failure(res));
    }
    
    createCameraMap(req, res, next) {
        let arg = {
            camera_map_detail: req.body
        };
        this.handler.createCameraMap(arg, this.success(res), this.failure(res));
    }

    getCameraMapById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getCameraMapById(arg, this.success(res), this.failure(res));
    }

    updateCameraMapById(req, res, next) {
        let arg = {
            _id: req.params.id,
            camera_map_detail: req.body
        };
        this.handler.updateCameraMapById(arg, this.success(res), this.failure(res));
    }

    deleteCameraMapById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteCameraMapById(arg, this.success(res), this.failure(res));
    }
}




function newCameraMapController() {
    return new CameraMapController();
}

module.exports.newCameraMapController = newCameraMapController;
