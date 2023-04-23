const { Controller } = require("./controller");
const { newCameraHandler } = require("../../../service/grpc_client/handler/camera_handler");

class CameraController extends Controller {
    constructor(cameraHandler=newCameraHandler()) {
        super();
        this.handler = cameraHandler;
        
        this.getAllCameras = this.getAllCameras.bind(this);
        this.createCamera = this.createCamera.bind(this);
        this.getCameraById = this.getCameraById.bind(this);
        this.updateCameraById = this.updateCameraById.bind(this);
        this.deleteCameraById = this.deleteCameraById.bind(this);
    }

    getAllCameras(req, res, next) {
        let arg = {};
        this.handler.getAllCameras(arg, this.success(res), this.failure(res));
    }
    
    createCamera(req, res, next) {
        let arg = {
            camera_detail: req.body
        };
        this.handler.createCamera(arg, this.success(res), this.failure(res));
    }

    getCameraById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getCameraById(arg, this.success(res), this.failure(res));
    }

    updateCameraById(req, res, next) {
        let arg = {
            _id: req.params.id,
            camera_detail: req.body
        };
        this.handler.updateCameraById(arg, this.success(res), this.failure(res));
    }

    deleteCameraById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteCameraById(arg, this.success(res), this.failure(res));
    }
}




function newCameraController() {
    return new CameraController();
}

module.exports.newCameraController = newCameraController;
