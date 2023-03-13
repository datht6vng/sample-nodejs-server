const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const areaSchema = new Schema (
    {
        area_name: {
            type: String,
            unique: true,
            required: true
        },
        address: String,
        map_url: String,
        // children: {
        //     type: [
        //         {
        //             type: Schema.Types.ObjectID,
        //             ref: 'Area'                
        //         }
        //     ],
        //     default: []
        // },
        parent_area: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        },




        
        floor_number: Number,
        lat: Number,
        lng: Number,
        area_type: {
            type: String,
            enum: ["building", "floor"]
        }
    }



)

module.exports = mongoose.model('Area', areaSchema);
