const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Camera = new Schema ({
    serial_number: {
        type: String,
        required: true
    },
    status: String,
    iot_device_id: {
        type: Schema.Types.ObjectId,
        ref: IotDevice
    },
    area_id: {
        type: Schema.Types.Objectid,
        ref: Area
    }
    
})

module.exports = mongoose.model('Camera', Camera);

