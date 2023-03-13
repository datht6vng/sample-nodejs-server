const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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


module.exports = mongoose.model('CameraMap', cameraMapSchema);
