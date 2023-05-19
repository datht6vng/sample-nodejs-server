const { Controller } = require("./controller");
const { newCameraHandler } = require("../../../service/grpc_client/handler/camera_handler");

const { newCameraRotationService } = require("../../../service/camera_rotation_service");

class CameraController extends Controller {
    constructor(cameraHandler=newCameraHandler()) {
        super();
        this.handler = cameraHandler;


        this.cameraRotationService = newCameraRotationService();

        
        this.getAllCameras = this.getAllCameras.bind(this);
        this.createCamera = this.createCamera.bind(this);
        this.getCameraById = this.getCameraById.bind(this);
        this.updateCameraById = this.updateCameraById.bind(this);
        this.deleteCameraById = this.deleteCameraById.bind(this);

        this.updateCamera = this.updateCamera.bind(this);
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


    async updateCamera(req, res, next) {
        const body = req.body;
        const cameraConfig = {
            hostname: body.hostname,
            username: body.username,
            password: body.password,
            port: body.port
        };
        const action = req.query.action;
        console.log(action, body)
        try {
            if (action == "relativeMove") {
                // Note: Trả về tọa độ hay không? hay handle frontend
                const connection = await this.cameraRotationService.getConnection(cameraConfig);
                const newCoord = await this.cameraRotationService.relativeMove(connection, body.x, body.y, body.z, body.zoom);
                this.success(res)();
            }
            else if (action == "absoluteMove") {
                await this.cameraRotationService.absoluteMove(cameraConfig, body.x, body.y, body.z, body.zoom);
                this.success(res)();
            }
            else if (action == "continuousMove") {
                await this.cameraRotationService.continuousMove(cameraConfig, body.x, body.y, body.z, body.zoom);
                this.success(res)();
            }
            else if (action == "stop") {
                await this.cameraRotationService.stop(cameraConfig);
                this.success(res)();
            }
            else if (action == "gotoPreset") {
                await this.cameraRotationService.gotoPreset(cameraConfig, body.preset, body.profileToken);
                this.success(res)();
            }
            else if (action == "setHomePosition") {
                await this.cameraRotationService.setHomePosition(cameraConfig, body.options);
                this.success(res)();
            }
            else if (action == "gotoHomePosition") {
                const connection = await this.cameraRotationService.getConnection(cameraConfig);
                const homePosition = await this.cameraRotationService.gotoHomePosition(connection, body.options);
                this.success(res)(200, "Success", homePosition);
            }
            else if (action == "getStatus") {
                const status = await this.cameraRotationService.getStatus(cameraConfig, body.options);
                this.success(res)(200, "Success", status);
            }
            else if (action == "getPresets") {
                const presets = await this.cameraRotationService.getPresets(cameraConfig);
                this.success(res)(200, "Success", presets);
            }
            else {
                throw new Error("Can't not found action method");
            }
        }
        catch(err) {
            this.failure(res)(404, err.toString());
        }

    }

}




function newCameraController() {
    return new CameraController();
}

module.exports.newCameraController = newCameraController;
