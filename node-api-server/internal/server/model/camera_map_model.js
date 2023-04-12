const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CameraModel = require("./camera_model");
const EventModel = require("./event_model");
const IotDeviceMapModel = require("./iot_device_map_model");

const cameraMapSchema = new Schema (
    {
        camera_name: {
            type: String,
            unique: true,
            required: true
        },

        address: String,

        lat: Number,
        lng: Number,


        type: {
            type: String,
            enum: ['iot', 'camera'],
            default: 'camera'
        },

        connect_camera: {
            type: Schema.Types.ObjectID,
            ref: 'Camera'
        },

        observe_iot: {
            type: Schema.Types.ObjectID,
            ref: 'IotDeviceMap'
        },

        area: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        }    
    }
)

async function deleteCameraMapRelation(schema) {
    const doc = await schema.model.findOne(schema.getFilter());

    if (doc) {

        // Handle complicated logic behind the merge API in frontend. It created the asynchronous data between frontend data and database data
        // ===> Happen when update 2 records refer to the same parent record and the app's business logic does not allow it 
        let docs = await schema.model.find({ connect_camera: doc.connect_camera });
        if (!docs || docs.length < 2) {
            await CameraModel.findOneAndUpdate({ _id: doc.connect_camera }, { status: "free" });
        }

        docs = await schema.model.find({ observe_iot: doc.observe_iot });
        if (!docs || docs.length < 2) {
            await IotDeviceMapModel.findOneAndUpdate({ _id: doc.observe_iot }, { observed_status: "free" });
        }

        await EventModel.findOneAndUpdate({ camera_map: doc._id }, { camera_map: null });
    }

}


cameraMapSchema.pre('save', async function(next) {
    const doc = this;
    await CameraModel.findOneAndUpdate({ _id: doc.connect_camera }, { status: "used" });
    await IotDeviceMapModel.findOneAndUpdate({ _id: doc.observe_iot }, { observed_status: "used" });
    next();
})

cameraMapSchema.pre('findOneAndUpdate', async function(next) {
    const doc = await this.model.findOne(this.getFilter());
    const updateDoc = this.getUpdate();
    if (doc) {
        if (updateDoc.connect_camera && doc.connect_camera != updateDoc.connect_camera) {
            let docs = await this.model.find({ connect_camera: doc.connect_camera });
            if (!docs || docs.length < 2) {
                await CameraModel.findOneAndUpdate({ _id: doc.connect_camera }, { status: "free" });
            }
        }



        if (updateDoc.observe_iot && doc.observe_iot != updateDoc.observe_iot) {
            let docs = await this.model.find({ observe_iot: doc.observe_iot });
            if (!docs || docs.length < 2) {
                await IotDeviceMapModel.findOneAndUpdate({ _id: doc.observe_iot }, { observed_status: "free" });
            }
        }
    }

    next();
})

cameraMapSchema.pre('findOneAndDelete', async function(next) {
    await deleteCameraMapRelation(this);
    next();
});

cameraMapSchema.pre('deleteMany', async function(next) {
    await deleteCameraMapRelation(this);
    next();
});


// cameraMapSchema.pre("remove", async function(next) {
//     const self = this;
//     await EventModel.deleteMany({ camera_map: self._id });
//     await IotDeviceMapModel.updateOne({ _id: self.observe_iot }, { observed_status: "free" });
//     next();
// })

module.exports = mongoose.model('CameraMap', cameraMapSchema);
