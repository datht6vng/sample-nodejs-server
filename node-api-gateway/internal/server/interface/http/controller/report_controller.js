const { Controller } = require("./controller");
const { newReportHandler } = require("../../../service/grpc_client/handler/report_handler");

class ReportController extends Controller {
    constructor(cameraHandler=newReportHandler()) {
        super();
        this.handler = cameraHandler;
        
        this.getReportByCondition = this.getReportByCondition.bind(this);
    }

    getReportByCondition(req, res, next) {
        let arg = {};

        if (req.query.action == "find_all_event_statistic_count") {
            arg = {}
            this.handler.findAllEventStatisticCount(arg, this.success(res), this.failure(res))
        }
        else if (req.query.action == "find_number_of_iot_event_by_type") {
            arg = {
                area_id: req.query.area_id,
                start_time: req.query.start_time,
                end_time: req.query.end_time
            }
            this.handler.findNumberOfIotEventByType(arg, this.success(res), this.failure(res))
        }
        else if (req.query.action == "find_number_of_iot_event_by_type_and_true_alarm") {
            arg = {
                area_id: req.query.area_id,
                start_time: req.query.start_time,
                end_time: req.query.end_time
            }
            this.handler.findNumberOfIotEventByTypeAndTrueAlarm(arg, this.success(res), this.failure(res))
        }
        else if (req.query.action == "find_number_of_iot_event_by_interval") {
            arg = {
                area_id: req.query.area_id,
                start_time: req.query.start_time,
                end_time: req.query.end_time,
                iot_device_type_id: req.query.iot_device_type_id,
                interval_type: req.query.interval_type
            }
            this.handler.findNumberOfIotEventByInterval(arg, this.success(res), this.failure(res))
        }
    }
    
}




function newReportController() {
    return new ReportController();
}

module.exports.newReportController = newReportController;
