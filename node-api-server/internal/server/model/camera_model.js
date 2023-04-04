const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventModel = require("./event_model");
const CameraMapModel = require("./camera_map_model");

const cameraSchema = new Schema (
    {
        camera_name: {
            type: String,
            unique: true,
            required: true
        },
        status: String,

        rtsp_stream_url: String,
        sfu_rtsp_stream_url: String,

        offset_x_begin: Number,
        offset_x_end: Number,
        offset_y_begin: Number,
        offset_y_end: Number,

        camera_type: {
            type: Schema.Types.ObjectID,
            ref: 'CameraType'
        },

        event_type: {
            type: Schema.Types.ObjectID,
            ref: 'EventType'
        }

    }
)

// cameraSchema.pre("remove", async function(next) {
//     const self = this;
//     await EventModel.deleteMany({ camera: self._id });
//     await CameraMapModel.updateMany({ connect_camera: self._id }, { connect_camera: null });
//     next();
// })


module.exports = mongoose.model('Camera', cameraSchema);
