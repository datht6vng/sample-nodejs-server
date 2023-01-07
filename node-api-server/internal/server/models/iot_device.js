const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IotDevice = new Schema ({
    serial_number: {
        type: String,
        required: true
    },
    status: String,
    camera_id: {
        type: Schema.Types.ObjectId,
        ref: Camera
    },
    area_id: {
        type: Schema.Types.Objectid,
        ref: Area
    }
    
})

module.exports = mongoose.model('IotDevice', IotDevice);

