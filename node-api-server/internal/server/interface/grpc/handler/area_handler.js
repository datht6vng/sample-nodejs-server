const Area = require("../../../models/area");

class AreaHandler {
    constructor() {

    }
}

AreaHandler.prototype.getAllAreas = async function(_, callback) {
    let areas = await Area.find();
    callback(null, areas);
}

AreaHandler.prototype.createArea = async function(area, callback) {
    let newArea = await IotDevice.create(area);
    callback(null, newArea);

}

module.exports.AreaHandler = AreaHandler;
