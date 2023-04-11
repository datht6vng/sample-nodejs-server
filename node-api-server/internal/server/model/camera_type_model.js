const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cameraType = new Schema (
    {
        camera_type_name: String,
        image_url: String,
        description: String
    }
)

module.exports = mongoose.model('CameraType', cameraType);
