const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventModel = require("./event_model");
const IotDeviceMapModel = require("./iot_device_map_model");

const iotDeviceSchema = new Schema (
    {
        iot_device_name: {
            type: String,
            unique: true,
            required: true
        },

        zone: Number,

        event_type: {
            type: Schema.Types.ObjectID,
            ref: 'EventType'
        },

        status: {
            type: String,
            enum: ['used', 'free'],
            default: 'free'
        },


        iot_device_type: {
            type: Schema.Types.ObjectID,
            ref: 'IotDeviceType'
        }

    }
);




async function deleteIotDeviceRelation(schema) {
    const doc = await schema.model.findOne(schema.getFilter());
    if (doc) {
        await IotDeviceMapModel.findOneAndUpdate({ connect_iot: doc._id }, { connect_iot: null });
        await EventModel.deleteMany({ iot_device: doc._id });
    }
}

iotDeviceSchema.pre('findOneAndDelete', async function(next) {
    await deleteIotDeviceRelation(this);
    next();
})

iotDeviceSchema.pre('deleteMany', async function(next) {
    await deleteIotDeviceRelation(this);
    next();
})



// iotDeviceSchema.pre("remove", async function(next) {
//     const self = this;
//     await EventModel.deleteMany({ iot_device: self._id });
//     await IotDeviceMapModel.updateMany({ connect_iot: self._id }, { connect_iot: null });
//     next();
// })

module.exports = mongoose.model('IotDevice', iotDeviceSchema);

