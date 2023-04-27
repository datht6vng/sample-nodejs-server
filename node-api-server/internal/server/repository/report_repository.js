const EventModel = require("../model/event_model");



class ReportRepository {
    
    
    
    async findNumberOfIotEventWithAreaAndTime(areaId, startTime, endTime) {
        EventModel.aggregate([
            {
                $lookup: {
                    from: "iotdevicemaps",
                    localField: 'iot_device_map',
                    foreignField: '_id',
                    as: 'iot_device_map'
                }
            },
            {
                $unwind: "$iot_device_map"
            },
            {
                $lookup: {
                    from: "iotdevices",
                    localField: 'connect_iot',
                    foreignField: '_id',
                    as: 'iot_device'
                }
            },
            {
                $unwind: "$iot_device"
            },
            {
                $lookup: {
                    from: "iotdevicetypes",
                    localField: "iot_device_type",
                    foreignField: '_id',
                    as: 'iot_device_type'
                }
            },
            {
                $unwind: "$iot_device_type"
            },
            {
                $lookup: {
                    from: "areas",
                    localField: 'area',
                    foreignField: '_id',
                    as: 'area'
                }
            },
            {
                $unwind: "$area"
            },

            {
                $match: { 
                    $and: [
                        { iot_device: { $exists: true, $ne: [null, undefined] } },
                        { iot_device_map: { $exists: true, $ne: [null, undefined] } },
                        { iot_device_type: { $exists: true, $ne: [null, undefined] } },
                        { event_time: { $gte: startTime, $lte: endTime } }
                    ]
                }
            },
            {
                $group: {
                  _id: { area: "$area", iot_event_type: "$iot_event_type" },
                  event_count: { $sum: 1 }
                },
            },
        ])
    }
}

function newReportRepository() {
    return new ReportRepository();
}

module.exports.newReportRepository = newReportRepository;
