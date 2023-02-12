const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cameraSchema = new Schema (
    {
        serial_number: String,
        camera_name: String,
        status: String,
        extra_information: String,
        x_position: Schema.Types.Decimal128,
        y_position: Schema.Types.Decimal128,
        z_position: Schema.Types.Decimal128,
        iot_device_id: {
            type: Schema.Types.ObjectID,
            ref: 'IotDevice'
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
)


module.exports = mongoose.model('Camera', cameraSchema);
