const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema (
    {
        event_type: {
            type: Schema.Types.ObjectID,
            ref: 'EventType'
        },
        iot_device: {
            type: Schema.Types.ObjectID,
            ref: 'IotDevice'
        },
        camera: {
            type: Schema.Types.ObjectID,
            ref: 'Camera'
        },
        iot_device_map: {
            type: Schema.Types.ObjectID,
            ref: 'IotDeviceMap'
        },
        camera_map: {
            type: Schema.Types.ObjectID,
            ref: 'CameraMap'
        },
        ai_true_alarm: {
            type: Boolean,
            default: false
        },
        human_true_alarm: {
            type: Boolean,
            default: false
        },


        normal_image_url: String,
        normal_video_url: String,

        detection_image_url: String,
        detection_video_url: String,



        event_time: Date,


        event_status: {
            type: String,
            enum: ['wait_for_processing', 'ai_verified', 'human_verified'],
            default: 'wait_for_processing'
        }, 
        comment: String

    },
    { 
        timestamps: { 
            createdAt: 'created_at',
            updatedAt: 'updated_at' 
        },
        timeseries: {
            timeField: 'event_time'
        },
    }
)

module.exports = mongoose.model('Event', eventSchema);
