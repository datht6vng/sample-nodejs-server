const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Area = new Schema ({
    name: {
        type: String,
        required: true
    },
    address: String
    
})

module.exports = mongoose.model('Area', Area);

