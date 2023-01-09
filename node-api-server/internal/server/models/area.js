const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Area = new Schema (
    {
        _id: Schema.Types.ObjectID,
        area_name: {
            type: String
        },
        address: String
    
    },
    { 
        timestamps: { 
            createdAt: 'created_at',
            updatedAt: 'updated_at' 
        }
    }

)

module.exports = mongoose.model('Area', Area);

