const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema (
    {
        username: String,
        password: String,
        role: {
            type: String,
            enum: ["admin", "supervisor", "normal_user"]
        }
    }
)

module.exports = mongoose.model('User', userSchema);
