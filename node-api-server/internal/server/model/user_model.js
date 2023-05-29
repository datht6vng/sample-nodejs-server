const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema (
    {
        username: {
            type: String,
            unique: true
        },
        password: String,
        role: {
            type: String,
            enum: ["admin", "supervisor", "normal_user"]
        }
    }
)

module.exports = mongoose.model('User', userSchema);
