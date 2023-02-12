const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const iotDeviceSchema = new Schema (
    {
        serial_number: String,
        device_name: String,
        device_type: String,
        config_zone: Number,
        status: String,
        // event_name: String,
        image_uri: String,
        extra_information: String,
        x_position: Schema.Types.Decimal128,
        y_position: Schema.Types.Decimal128,
        z_position: Schema.Types.Decimal128,
        camera_id: {
            type: Schema.Types.ObjectID,
            ref: 'Camera'
        },
        area_id: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        }

    },
    { 
        timestamps: { 
            createdAt: 'created_at',
            updatedAt: 'updated_at' 
        } 
    }
);

module.exports = mongoose.model('IotDevice', iotDeviceSchema);

