const { newAreaService } = require("../../../service/area_service");
const { newErrorHandler } = require("../../../util/error/error_handler");

const { Handler } = require("./handler");

class AreaHandler extends Handler {
    constructor() {

    }
}

AreaHandler.prototype.getAllAreas = function(call, callback) {
    const areaService = newAreaService();
    const self = this;
    areaService.getAllAreas()
    .then(areas => {
        self.success(areas, callback);
    })
    .catch(err => {
        self.failure(err, callback);
    })
}

AreaHandler.prototype.createArea = function(call, callback) {
    const areaService = newAreaService();
    const self = this;
    areaService.createArea(call.request.area_detail)
    .then(area => {
        console.log(area);
        self.success({
            area_detail: area
        })
        // const response = {
        //     data: {
        //         area_detail: area
        //     },
        //     message: "success",
        //     status: "temp"
        // }
        // callback(null, response);
    })
    .catch(err => {
        self.failure(err, callback);
    })

}

function newAreaHandler() {
    return new AreaHandler();
}

module.exports.newAreaHandler = newAreaHandler;
