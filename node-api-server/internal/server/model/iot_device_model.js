const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventModel = require("./event_model");
const IotDeviceMapModel = require("./iot_device_map_model");

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

// iotDeviceSchema.pre("remove", async function(next) {
//     const self = this;
//     await EventModel.deleteMany({ iot_device: self._id });
//     await IotDeviceMapModel.updateMany({ connect_iot: self._id }, { connect_iot: null });
//     next();
// })

module.exports = mongoose.model('IotDevice', iotDeviceSchema);

