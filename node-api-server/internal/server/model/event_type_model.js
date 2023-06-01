const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventTypeSchema = new Schema (
    {
        event_key: {    // Distinguish event from many source
            type: String,
            unique: true,
            required: true
        }, 
        event_name: String,
        event_description: String,
        device_type: {
            type: String,
            enum: ["camera", "iot"]
        }
    }
)

// Haven't handled middleware yet

module.exports = mongoose.model('EventType', eventTypeSchema);
