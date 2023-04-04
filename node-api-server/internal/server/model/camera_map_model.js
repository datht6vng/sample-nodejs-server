const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventModel = require("./event_model");
const IotDeviceMapModel = require("./iot_device_map_model");

const cameraMapSchema = new Schema (
    {
        camera_name: {
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
            default: 'camera'
        },

        connect_camera: {
            type: Schema.Types.ObjectID,
            ref: 'Camera'
        },

        observe_iot: {
            type: Schema.Types.ObjectID,
            ref: 'IotDeviceMap'
        },

        area: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        }    
    }
)


// cameraMapSchema.pre("remove", async function(next) {
//     const self = this;
//     await EventModel.deleteMany({ camera_map: self._id });
//     await IotDeviceMapModel.updateOne({ _id: self.observe_iot }, { observed_status: "free" });
//     next();
// })

module.exports = mongoose.model('CameraMap', cameraMapSchema);
