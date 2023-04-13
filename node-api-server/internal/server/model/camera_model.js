const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const cameraSchema = new Schema (
    {
        camera_name: {
            type: String,
            unique: true,
            required: true
        },
        status: String,

        rtsp_stream_url: String,
        sfu_rtsp_stream_url: String,
        username: String, // rtsp stream username
        password: String, // rtsp stream password

        offset_x_begin: Number,
        offset_x_end: Number,
        offset_y_begin: Number,
        offset_y_end: Number,
        is_set_line: {
            type: Boolean,
            default: false
        },

        camera_type: {
            type: Schema.Types.ObjectID,
            ref: 'CameraType'
        },

        event_type: {
            type: Schema.Types.ObjectID,
            ref: 'EventType'
        }

    }
)

async function deleteCameraRelation(schema) {
    const doc = await schema.model.findOne(schema.getFilter());
    if (doc) {
        await mongoose.model("CameraMap").findOneAndUpdate({ connect_camera: doc._id }, { connect_camera: null });
        await mongoose.model("Event").deleteMany({ camera: doc._id });
    }
}

cameraSchema.pre('findOneAndDelete', async function(next) {
    await deleteCameraRelation(this);
    next();
})

cameraSchema.pre('deleteMany', async function(next) {
    await deleteCameraRelation(this);
    next();
})

// cameraSchema.pre("remove", async function(next) {
//     const self = this;
//     await mongoose.model("Event").deleteMany({ camera: self._id });
//     await mongoose.model("CameraMap").updateMany({ connect_camera: self._id }, { connect_camera: null });
//     next();
// })


module.exports = mongoose.model('Camera', cameraSchema);
