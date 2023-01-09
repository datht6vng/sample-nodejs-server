const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Area = new Schema ({
    area_name: {
        type: String
    },
    address: String
    
})

module.exports = mongoose.model('Area', Area);

