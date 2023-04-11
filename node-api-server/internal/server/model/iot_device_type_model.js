const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const iotDeviceTypeSchema = new Schema (
    {
        iot_device_type_name: String,
        image_url: String,
        description: String
    }
)

module.exports = mongoose.model('IotDeviceType', iotDeviceTypeSchema);
