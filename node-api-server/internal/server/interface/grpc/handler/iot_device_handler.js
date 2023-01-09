const IotDevice = require('../../../models/iot_device');


class IotDeviceHandler {
    constructor() {

    }


}

IotDeviceHandler.prototype.getAllDevices = async function(_, callback) {
    
    let devices = await IotDevice.find().populate('camera_id').populate('area_id');
    console.log(devices);
    // for (let i = 0; i < devices.length; i++) {
    //     devices[i] = {
    //         id: devices[i]._id,
    //         device_name: devices[i].device_name,
    //         device_type: devices[i].device_type,
    //         config_zone: devices[i].config_zone,
    //         status: devices[i].status,
    //         camera_detail: {
    //             id: devices[i].camera_id._id,
    //             name: devices[i].camera_id.device_name
    //         },
    //         area_detail: {
    //             id: devices[i].area_id._id,
    //             name: devices[i].area_id.area_name 
    //         }
    //     }
    // }

    callback(null, devices);
}

IotDeviceHandler.prototype.getDevice = async function(device, callback) {
    let data = await IotDevice.find(device).populate('camera_id').populate('area_id');
    callback(null, data);

}

IotDeviceHandler.prototype.createDevice = async function(device, callback) {
    // let { camera_detail, area_detail, ...others } = data; 
    // let newDevice = new IotDevice({
    //     camera_id: camera_detail.id,
    //     area_id: area_detail.id,
    //     ...others
    // })
    // newDevice.save(function(err, device) {
    //     if (err) console.log(err);
    //     console.log(device);
    // })

    let newDevice = await IotDevice.create(device);
    callback(null, newDevice);

}

module.exports.IotDeviceHandler = IotDeviceHandler;

