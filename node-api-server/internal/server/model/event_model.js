const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = new Schema (
    {
        event_name: String,
        iot_device_id: {
            type: Schema.Types.ObjectID,
            ref: 'IotDevice'
        },
        camera_id: {
            type: Schema.Types.ObjectID,
            ref: 'Camera'
        },
        area_id: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        },
        true_alarm: Boolean,
        status: String,
        image_uri: String,
        video_uri: String,
        event: String,
        zone: String,
        area: String,
        start_time: Date,
        end_time: Date
    },
    { 
        timestamps: { 
            createdAt: 'created_at',
            updatedAt: 'updated_at' 
        } 
    }
)

module.exports = mongoose.model('Event', eventSchema);

