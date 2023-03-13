const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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

        camera_device_type: {
            type: Schema.Types.ObjectID,
            ref: 'CameraType'
        },

        event_type: {
            type: Schema.Types.ObjectID,
            ref: 'EventType'
        }

    }
)


module.exports = mongoose.model('Camera', cameraSchema);
