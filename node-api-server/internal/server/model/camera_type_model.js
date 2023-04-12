const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CameraModel = require("./camera_model");

const cameraTypeSchema = new Schema (
    {
        camera_type_name: String,
        image_url: String,
        description: String
    }
)

async function deleteCameraTypeRelation(schema) {
    const doc = await schema.model.findOne(schema.getFilter());
    
    if (doc) {
        await CameraModel.updateMany({ _id: doc._id }, { camera_type: null });
    }
}

cameraTypeSchema.pre('findOneAndDelete', async function(next) {
    await deleteCameraTypeRelation(this);
    next();
})

cameraTypeSchema.pre('deleteMany', async function(next) {
    await deleteCameraTypeRelation(this);
    next();
})

module.exports = mongoose.model('CameraType', cameraTypeSchema);
