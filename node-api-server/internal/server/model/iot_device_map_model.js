const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const iotDeviceMapSchema = new Schema (
    {
        iot_device_name: {
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
            default: 'iot'
        },

        observed_status: {
            type: String,
            enum: ['used', 'free'],
            default: 'free'
        },
        connect_iot: {
            type: Schema.Types.ObjectID,
            ref: 'IotDevice'
        },

        area: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        }

    }
);



async function deleteIotDeviceMapRelation(schema) {
    const doc = await schema.model.findOne(schema.getFilter());

    if (doc) {
        let docs = await schema.model.find({ connect_iot: doc.connect_iot });
        if (!docs || docs.length < 2) {
            await mongoose.model("IotDevice").findOneAndUpdate({ _id: doc.connect_iot }, { status: "free" });
        }

        await mongoose.model("Event").findOneAndUpdate({ iot_device_map: doc._id }, { iot_device_map: null });

        await mongoose.model("CameraMap").findOneAndUpdate({ observe_iot: doc._id }, { observe_iot: null });
    }

}


iotDeviceMapSchema.pre('save', async function(next) {
    const doc = this;
    await mongoose.model("IotDevice").findOneAndUpdate({ _id: doc.connect_iot }, { status: "used" });
    next();
})

iotDeviceMapSchema.pre('findOneAndUpdate', async function(next) {
    const doc = await this.model.findOne(this.getFilter());
    const updateDoc = this.getUpdate();
    if (doc) {
        if (updateDoc.connect_iot !== undefined && doc.connect_iot != updateDoc.connect_iot) {
            let docs = await this.model.find({ connect_iot: doc.connect_iot });
            if (!docs || docs.length < 2) {
                await mongoose.model("IotDevice").findOneAndUpdate({ _id: doc.connect_iot }, { status: "free" });
            }
        }

        await mongoose.model("IotDevice").findOneAndUpdate({ _id: updateDoc.connect_iot }, { status: "used" });
    }

    next();
})

iotDeviceMapSchema.pre('findOneAndDelete', async function(next) {
    await deleteIotDeviceMapRelation(this);
    next();
});

iotDeviceMapSchema.pre('deleteMany', async function(next) {
    await deleteIotDeviceMapRelation(this);
    next();
});




// iotDeviceMapSchema.pre("remove", async function(next) {
//     const self = this;
//     await mongoose.model("Event").deleteMany({ iot_device_map: self._id });
//     await mongoose.model("CameraMap").updateMany({ observe_iot: self._id }, { $set: { observe_iot: null } });
//     next();
// })

module.exports = mongoose.model('IotDeviceMap', iotDeviceMapSchema);



