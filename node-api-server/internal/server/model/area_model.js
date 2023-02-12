const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const areaSchema = new Schema (
    {
        area_name: String,
        address: String,
        map_uri: String,
        children: {
            type: [
                {
                    type: Schema.Types.ObjectID,
                    ref: 'Area'                
                }
            ],
            default: []
        } ,
        parent: {
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

module.exports = mongoose.model('Area', areaSchema);
