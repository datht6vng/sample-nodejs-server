
const Cam = require("onvif").Cam;

class CameraRotationService {

    getConnection(cameraConfig) {
        return new Promise((resolve, reject) => {
            new Cam(cameraConfig, function (err) {
                if (err) {
                    reject(err);
                }
                resolve(this);
            });
        });
    }

    async relativeMove(cameraConfig, x, y, z, zoom) {
        const connection = await this.getConnection(cameraConfig);
        connection.relativeMove({
            x: x,
            y: y,
            zoom: zoom
        });
    }

    async absoluteMove(cameraConfig, x, y, z, zoom) {
        const connection = await this.getConnection(cameraConfig);
        connection.absoluteMove({
            x: x,
            y: y,
            zoom: zoom
        });
    }

    async continuousMove(cameraConfig, x, y, z, zoom) {
        const connection = await this.getConnection(cameraConfig);
        connection.continuousMove({
            x: x,
            y: y,
            zoom: zoom
        });
    }

    async stop(cameraConfig) {
        const connection = await this.getConnection(cameraConfig);
        connection.stop();
    }

    async getStatus(cameraConfig) {
        const connection = await this.getConnection(cameraConfig);
        return new Promise((resolve, reject) => {
            connection.getStatus((err, object) => {
                if (err) {
                    reject(err);
                }
                resolve(object);
            });
        })
    }


    async getPresets(cameraConfig) {
        const connection = await this.getConnection(cameraConfig);
        return new Promise((resolve, reject) => {
            connection.getPresets((err, object) => {
                if (err) {
                    reject(err);
                }
                resolve(object);
            });
        })
    }

    async gotoPreset(cameraConfig, preset, profileToken) {
        const connection = await this.getConnection(cameraConfig);
        connection.gotoPreset(
            {
                preset: preset
            }
        );
    }


    async setHomePosition(cameraConfig, options) {
        const connection = await this.getConnection(cameraConfig);
        connection.setHomePosition(options);
    }

    async gotoHomePosition(cameraConfig) {
        const connection = await this.getConnection(cameraConfig);
        connection.gotoHomePosition({}, (err) => {});
    }
}

function newCameraRotationService() {
    return new CameraRotationService();
}

module.exports.newCameraRotationService = newCameraRotationService;
