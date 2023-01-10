const IotDevice = require('../../../models/iot_device');


class IotDeviceHandler {
    constructor() {

    }


}

IotDeviceHandler.prototype.getAllDevices = async function(_, callback) {
    console.log(222222)
    let devices = await IotDevice.find().populate('camera_id').populate('area_id');
    console.log(devices);
    let res = {
        iot_devices: devices
    }
    callback(null, res);
}

IotDeviceHandler.prototype.getDevice = async function(req, callback) {
    let data = await IotDevice.find(req.request).populate('camera_id').populate('area_id');
    callback(null, data);

}

IotDeviceHandler.prototype.createDevice = async function(req, callback) {
    
    req.request.camera_id = "73bba2c30953043cd7d792a3";
    req.request.area_id = "63bba2c30953043cd7d792a3";
    

    let newDevice = await IotDevice.create(req.request);
    newDevice = await IotDevice.findOne({ _id: newDevice._id }).populate('camera_id').populate('area_id');
    console.log(newDevice)
    callback(null, newDevice);

}

module.exports.IotDeviceHandler = IotDeviceHandler;

