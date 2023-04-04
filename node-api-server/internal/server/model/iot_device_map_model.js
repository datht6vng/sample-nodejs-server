const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventModel = require("./event_model");
const CameraMapModel = require("./camera_map_model");

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

// iotDeviceMapSchema.pre("remove", async function(next) {
//     const self = this;
//     await EventModel.deleteMany({ iot_device_map: self._id });
//     await CameraMapModel.updateMany({ observe_iot: self._id }, { $set: { observe_iot: null } });
//     next();
// })

module.exports = mongoose.model('IotDeviceMap', iotDeviceMapSchema);



