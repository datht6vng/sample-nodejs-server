const Camera = require('../../../models/camera');


class CameraHandler {
    constructor() {

    }


}

CameraHandler.prototype.getAllDevices = async function(_, callback) {
    let devices = await Camera.find().populate('area_id');
    callback(null, devices);
}

CameraHandler.prototype.getDevice = async function(device, callback) {
    let device = await Camera.find(device).populate('area_id');
    callback(null, device);

}



CameraHandler.prototype.createDevice = async function(device, callback) {
    let newDevice = await Camera.create(device);
    callback(null, newDevice);

}

module.exports.CameraHandler = CameraHandler;

