const { newReportService } = require("../../../service/report_service");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class ReportHandler extends Handler {
    constructor(service=newReportService()) {
        super();
        this.service = service;
    }

    async findAllEventStatisticCount(call, callback) {
        this.service.findAllEventStatisticCount()
        .then(doc => {
            this.success(doc, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })   
    }

    findNumberOfIotEventByType(call, callback) {

        const areaId = newId(call.request.area_id);
        const startTime = call.request.start_time;
        const endTime = call.request.end_time;

        this.service.findNumberOfIotEventByType(areaId, startTime, endTime)
        .then(doc => {
            this.success(doc, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    findNumberOfIotEventByTypeAndTrueAlarm(call, callback) {
        const areaId = newId(call.request.area_id);
        const startTime = call.request.start_time;
        const endTime = call.request.end_time;

        this.service.findNumberOfIotEventByTypeAndTrueAlarm(areaId, startTime, endTime)
        .then(doc => {
            this.success(doc, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }



    findNumberOfIotEventByInterval(call, callback) {
        const areaId = newId(call.request.area_id);
        const startTime = call.request.start_time;
        const endTime = call.request.end_time;
        const iotDeviceTypeId = newId(call.request.iot_device_type_id)
        const intervalType = call.request.interval_type

        this.service.findNumberOfIotEventByInterval(areaId, startTime, endTime, iotDeviceTypeId, intervalType)
        .then(doc => {
            this.success(doc, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newReportHandler() {
    return new ReportHandler();
}

module.exports.newReportHandler = newReportHandler;
