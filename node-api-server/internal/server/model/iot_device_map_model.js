const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const iotDeviceMapSchema = new Schema (
    {
        iot_device_name: {
            type: String,
            unique: true,
            required: true
        },

        address: String,

        lat: Number,
        lng: Number,

        type: {
            type: String,
            enum: ['iot', 'camera'],
            default: 'iot'
        },

        observed_status: {
            type: String,
            enum: ['used', 'free'],
            default: 'free'
        },
        connect_iot: {
            type: Schema.Types.ObjectID,
            ref: 'IotDevice'
        },

        area: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        }

    }
);

module.exports = mongoose.model('IotDeviceMap', iotDeviceMapSchema);



