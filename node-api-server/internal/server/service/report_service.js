
const { newReportRepository } = require("../repository/report_repository");


class ReportService {
    constructor(repository=newReportRepository()) {
        this.repository = repository;
    }

    async findNumberOfIotEventByType(areaId, startTime, endTime) {
        const doc = await this.repository.findNumberOfIotEventByType(areaId, startTime, endTime);
        return doc;
    }

    async findNumberOfIotEventByTypeAndTrueAlarm(areaId, startTime, endTime) {
        const doc = await this.repository.findNumberOfIotEventByTypeAndTrueAlarm(areaId, startTime, endTime);
        return doc;
    }

    async findNumberOfIotEventByInterval(areaId, startTime, endTime, iotDeviceTypeId, intervalType) {
        const doc = await this.repository.findNumberOfIotEventByInterval(areaId, startTime, endTime, iotDeviceTypeId, intervalType);
        return doc;
    }

    async findAllEventStatisticCount() {
        const doc = await this.repository.findAllEventStatisticCount();
        return doc;
    }
}



function newReportService(repository=newReportRepository()) {
    return new ReportService(repository);
}


module.exports.newReportService = newReportService;
