const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Area = require("./area");

const Camera = new Schema ({
    serial_number: {
        type: String
    },
    camera_name: String,
    status: String,
    area_id: {
        type: Schema.Types.ObjectID,
        ref: Area
    }
    
})

module.exports = mongoose.model('Camera', Camera);

