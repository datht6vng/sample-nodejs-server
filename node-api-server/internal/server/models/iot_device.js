const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Camera = require("./camera");
const Area = require("./area");

const IotDevice = new Schema ({
    serial_number: {
        type: String
    },
    device_name: String,
    device_type: String,
    config_zone: String,
    status: String,
    camera_id: {
        type: Schema.Types.ObjectID,
        ref: Camera
    },
    area_id: {
        type: Schema.Types.ObjectID,
        ref: Area
    }
    
})

module.exports = mongoose.model('IotDevice', IotDevice);

