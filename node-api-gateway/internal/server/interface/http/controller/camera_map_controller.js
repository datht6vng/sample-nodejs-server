const { Controller } = require("./controller");
const {newCameraMapService} = require("../../service/grpc/camera_map_service");

class CameraMapController extends Controller {
    constructor(cameraMapService=newCameraMapService()) {
        super();
        this.service = cameraMapService;
    }
}

CameraMapController.prototype.getAllCamerasMap = function(req, res, next) {
    let arg = {};
    this.service.getAllCamerasMap(arg, this.success(res), this.failure(res));
}


function newCameraMapController() {
    return new CameraMapController();
}

module.exports.newCameraMapController = newCameraMapController;
