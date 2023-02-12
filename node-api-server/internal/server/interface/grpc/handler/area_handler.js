const { newAreaService } = require("../../../service/area_service");
const { newErrorHandler } = require("../../../util/error/error_handler");

class AreaHandler {
    constructor() {

    }
}

AreaHandler.prototype.getAllAreas = async function(_, callback) {
    const areaService = newAreaService();
    const response = {
        data: areaService.getAllAreas(),
        message: "success",
        status: "temp"
    }
    callback(null, response);
}

AreaHandler.prototype.createArea = async function(area, callback) {

    const areaService = newAreaService();
    areaService.createArea(area.request.area_detail)
    .then(area => {
        console.log(area);
        const response = {
            data: {
                area_detail: area
            },
            message: "success",
            status: "temp"
        }
        callback(null, response);
    })
    .catch(err => {
        console.log(err);
    })

}

function newAreaHandler() {
    return new AreaHandler();
}

module.exports.newAreaHandler = newAreaHandler;
