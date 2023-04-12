const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IotDeviceModel = require("./iot_device_model");

const iotDeviceTypeSchema = new Schema (
    {
        iot_device_type_name: String,
        image_url: String,
        description: String
    }
)


async function deleteIotDeviceTypeRelation(schema) {
    const doc = await schema.model.findOne(schema.getFilter());
    
    if (doc) {
        await IotDeviceModel.updateMany({ _id: doc._id }, { iot_device_type: null });
    }
}

iotDeviceTypeSchema.pre('findOneAndDelete', async function(next) {
    await deleteIotDeviceTypeRelation(this);
    next();
})

iotDeviceTypeSchema.pre('deleteMany', async function(next) {
    await deleteIotDeviceTypeRelation(this);
    next();
})



module.exports = mongoose.model('IotDeviceType', iotDeviceTypeSchema);
