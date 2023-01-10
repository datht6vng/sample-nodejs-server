const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Area = require("./area");

const Camera = new Schema (
    {
        _id: Schema.Types.ObjectID,
        serial_number: {
            type: String
        },
        camera_name: String,
        status: String,
        area_id: {
            type: Schema.Types.ObjectID,
            ref: Area
        }
    
    },
    { 
        timestamps: { 
            createdAt: 'created_at',
            updatedAt: 'updated_at' 
        } 
    }
)






module.exports = mongoose.model('Camera', Camera);

