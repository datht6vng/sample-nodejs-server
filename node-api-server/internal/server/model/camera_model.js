const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { newStreamConnectionService } = require("../service/stream_connection_service");
const { newFromDatabaseConverter } = require("../data_converter/from_database_converter");
const { newToDatabaseConverter } = require("../data_converter/to_database_converter");
const { newCamera } = require("../entity/camera");
const { newErrorHandler } = require("../error/error_handler");

const streamConnectionService = newStreamConnectionService();
const fromDatabaseConverter = newFromDatabaseConverter();
const toDatabaseConverter = newToDatabaseConverter();
const errorHandler = newErrorHandler();


const cameraSchema = new Schema (
    {
        camera_name: {
            type: String,
            unique: true,
            required: true
        },
        status: {
            type: String,
            enum: ['used', 'free'],
            default: 'free'
        },

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
        },
        connect_to_rtsp_sender: {
            type: Boolean,
            default: false
        },
        connect_to_ai: {
            type: Boolean, 
            default: false
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




async function createStreamConnection(schema) {
    let state = newCamera();
    try {
        const doc = await mongoose.model("Camera").findOne({ _id: schema._id }).populate("event_type");
        const camera = fromDatabaseConverter.visit(newCamera(), doc);
        await streamConnectionService.handleCreateStream(camera, state);
    }
    catch(err) {
        errorHandler.execute(err);
        errorHandler.execute(new Error("Failed when creating stream connection to other servers"));
    }
    finally {
        state = toDatabaseConverter.visit(state);
        await mongoose.model('Camera').findOneAndUpdate({ _id: state._id }, state);
    }

}


async function updateStreamConnection(schema) {
    try {
        const doc = await schema.model.findOne(schema.getFilter());
        const updateDoc = schema.getUpdate();
        if (updateDoc.connect_to_rtsp_sender = undefined && updateDoc.connect_to_ai == undefined && doc) {
            const oldCamera = fromDatabaseConverter.visit(newCamera(), doc);
            const updateCamera = fromDatabaseConverter.visit(newCamera(), updateDoc);
            let state = await streamConnectionService.handleUpdateStream(oldCamera, updateCamera);
            state = toDatabaseConverter.visit(state);
            await mongoose.model('Camera').findOneAndUpdate({ _id: state._id }, state);
        }
    }
    catch(err) {
        errorHandler.execute(err);
        errorHandler.execute(new Error("Failed when updating stream connection to other servers"));
    }
}

async function deleteStreamConnection(schema) {
    try {
        const doc = await schema.model.findOne(schema.getFilter());
        if (doc) {
            const camera = fromDatabaseConverter.visit(newCamera(), doc);
            await streamConnectionService.handleDeleteStream(camera);
        }
    }
    catch(err) {
        errorHandler.execute(err);
        errorHandler.execute(new Error("Failed when deleting stream connection to other servers"));
    }

}

cameraSchema.post('save', async function(doc) {
    createStreamConnection(this);
})

cameraSchema.pre('findOneAndUpdate', async function(next) {
    updateStreamConnection(this);
    next();
})


cameraSchema.pre('findOneAndDelete', async function(next) {
    await deleteCameraRelation(this);
    deleteStreamConnection(this);
    next();
})

cameraSchema.pre('deleteMany', async function(next) {
    await deleteCameraRelation(this);
    deleteStreamConnection(this);
    next();
})

// cameraSchema.pre("remove", async function(next) {
//     const self = this;
//     await mongoose.model("Event").deleteMany({ camera: self._id });
//     await mongoose.model("CameraMap").updateMany({ connect_camera: self._id }, { connect_camera: null });
//     next();
// })


module.exports = mongoose.model('Camera', cameraSchema);
