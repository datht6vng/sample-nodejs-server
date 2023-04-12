const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CameraMapModel = require("./camera_map_model");
const IotDeviceMapModel = require("./iot_device_map_model");

const areaSchema = new Schema (
    {
        area_name: {
            type: String,
            unique: true,
            required: true
        },
        address: String,
        map_url: String,
        parent_area: {
            type: Schema.Types.ObjectID,
            ref: 'Area'
        },

        floor_number: Number,
        floor_level: Number,
        lat: Number,
        lng: Number,
        area_type: {
            type: String,
            enum: ["building", "floor", "area"]
        }
    }
)

async function deleteAreaCascade(schema) {
    const doc = await schema.model.findOne(schema.getFilter());
    if (doc) {
        await schema.model.deleteMany({ parent_area: doc._id });
        await CameraMapModel.deleteMany({ area: doc._id });
        await IotDeviceMapModel.deleteMany({ area: doc._id });
    }
}


areaSchema.pre('findOneAndDelete', async function(next) {
    await deleteAreaCascade(this);
    next();
});

areaSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
    await deleteAreaCascade(this);
    next();
});


// areaSchema.pre("remove", async function(next) {
//     const self = this;
//     await this.model("Area").deleteMany({ parent_area: self._id });
//     await CameraMapModel.deleteMany({ area: self._id })
//     await IotDeviceMapModel.deleteMany({ area: self._id });
//     next();
// });

module.exports = mongoose.model('Area', areaSchema);
