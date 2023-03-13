const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const iotDeviceSchema = new Schema (
    {
        iot_device_name: {
            type: String,
            unique: true,
            required: true
        },

        zone: Number,

        event_type: {
            type: Schema.Types.ObjectID,
            ref: 'EventType'
        },

        status: {
            type: String,
            enum: ['used', 'free'],
            default: 'free'
        },


        iot_device_type: {
            type: Schema.Types.ObjectID,
            ref: 'IotDeviceType'
        }

    }
);

module.exports = mongoose.model('IotDevice', iotDeviceSchema);

