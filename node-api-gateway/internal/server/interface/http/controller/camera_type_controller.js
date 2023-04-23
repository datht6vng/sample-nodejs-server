const { Controller } = require("./controller");
const { newCameraTypeHandler } = require("../../../service/grpc_client/handler/camera_type_handler");

class CameraTypeController extends Controller {
    constructor(cameraTypeHandler=newCameraTypeHandler()) {
        super();
        this.handler = cameraTypeHandler;
        
        this.getAllCameraTypes = this.getAllCameraTypes.bind(this);
        this.createCameraType = this.createCameraType.bind(this);
        this.getCameraTypeById = this.getCameraTypeById.bind(this);
        this.updateCameraTypeById = this.updateCameraTypeById.bind(this);
        this.deleteCameraTypeById = this.deleteCameraTypeById.bind(this);
    }

    getAllCameraTypes(req, res, next) {
        let arg = {};
        this.handler.getAllCameraTypes(arg, this.success(res), this.failure(res));
    }
    
    createCameraType(req, res, next) {
        let arg = {
            camera_type_detail: req.body
        };
        this.handler.createCameraType(arg, this.success(res), this.failure(res));
    }

    getCameraTypeById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getCameraTypeById(arg, this.success(res), this.failure(res));
    }

    updateCameraTypeById(req, res, next) {
        let arg = {
            _id: req.params.id,
            camera_type_detail: req.body
        };
        this.handler.updateCameraTypeById(arg, this.success(res), this.failure(res));
    }

    deleteCameraTypeById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteCameraTypeById(arg, this.success(res), this.failure(res));
    }
}




function newCameraTypeController() {
    return new CameraTypeController();
}

module.exports.newCameraTypeController = newCameraTypeController;
