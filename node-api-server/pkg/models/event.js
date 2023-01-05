const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Event = new Schema ({
    name: String,
    iot_device_id: {
        type: Schema.Types.ObjectId,
        ref: IotDevice
    },
    area_id: {
        type: Schema.Types.Objectid,
        ref: Area
    }
    
})

module.exports = mongoose.model('Event', Event);

