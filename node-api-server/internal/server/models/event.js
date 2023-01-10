const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IotDevice = require("./iot_device");
const Area = require("./area");

const Event = new Schema (
    {
        name: String,
        iot_device_id: {
            type: Schema.Types.ObjectID,
            ref: IotDevice
        },
        area_id: {
            type: Schema.Types.ObjectID,
            ref: Area
        },
        true_alarm: Boolean,
        status: String,
        image_link: String,
        event: String,
        zone: String,
        area: String,
        event_time: Date
    },
    { 
        timestamps: { 
            createdAt: 'created_at',
            updatedAt: 'updated_at' 
        } 
    }
)

module.exports = mongoose.model('Event', Event);

