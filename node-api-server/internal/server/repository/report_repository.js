const EventModel = require("../model/event_model");

const { newInternalServerError } = require("../entity/error/internal_server_error");


const DATE = "date";
const MONTH = "month";
const WEEK = "week";
const YEAR = "year";


class ReportRepository {

    getIotEventLookupPipeline() {
        const pipeline = [
            {
                $lookup: {
                    from: "iotdevices",
                    localField: 'iot_device',
                    foreignField: '_id',
                    as: 'iot_device'   
                }
            },
            {
                $unwind: "$iot_device"
            },
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
                    from: "iotdevicetypes",
                    localField: 'iot_device._id',
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
                    localField: 'iot_device_map.area',
                    foreignField: '_id',
                    as: 'area'   
                }
            }, 
            {
                $unwind: "$area"
            }
        ]

        return pipeline;
    }
    
    async findNumberOfIotEventByType(areaId, startTime, endTime) {
        areaId = areaId.getValue();
        let lookupPipeline = this.getIotEventLookupPipeline();
        let matchPipeline = [
            {
                $match: {
                    $and: [
                        { "area._id": { $eq: areaId } },
                        { event_time: { $gte: startTime, $lte: endTime } }
                    ]
                }
            }
        ];
        let groupPipeline = [
            {
                $group: {
                    _id: {
                        iot_device_type: "$iot_device_type"
                    },
                    event_count: { $sum: 1 }
                }
            }
        ]

        let pipeline = lookupPipeline.concat(matchPipeline, groupPipeline);

        let doc;
        try {
            doc = await EventModel.aggregate(pipeline).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return doc;
    }




    async findNumberOfIotEventByTypeAndTrueAlarm(areaId, startTime, endTime) {
        areaId = areaId.getValue();
        let lookupPipeline = this.getIotEventLookupPipeline();
        let matchPipeline = [
            {
                $match: {
                    $and: [
                        { "area._id": { $eq: areaId } },
                        { event_time: { $gte: startTime, $lte: endTime } }
                    ]
                }
            }
        ];
        let groupPipeline = [
            {
                $group: {
                    _id: {
                        iot_device_type: "$iot_device_type",
                        ai_true_alarm: "$ai_true_alarm"
                    },
                    event_count: { $sum: 1 }
                }
            }
        ]

        let pipeline = lookupPipeline.concat(matchPipeline, groupPipeline);

        let doc;
        try {
            doc = await EventModel.aggregate(pipeline).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return doc;
    }


    async findNumberOfIotEventByInterval(areaId, startTime, endTime, iotDeviceTypeId, intervalType=DATE) {
        areaId = areaId.getValue();
        iotDeviceTypeId = iotDeviceTypeId.getValue();
        let lookupPipeline = this.getIotEventLookupPipeline();
        let matchPipeline = [
            {
                $match: {
                    $and: [
                        { "area._id": { $eq: areaId } },
                        { "iot_device_type._id": { $eq: iotDeviceTypeId } },
                        { event_time: { $gte: startTime, $lte: endTime } }
                    ]
                }
            }
        ];


        let groupId;
        if (intervalType == DATE) {
            groupId = {
                year: { $year: "$event_time" },
                month: { $month: "$event_time" },
                day: { $dayOfMonth: "$event_time" }
            }
        }
        else if (intervalType == WEEK) {
            groupId = {
                year: { $year: "$event_time" },
                month: { $month: "$event_time" },
                week: { $week: "$event_time" }
            }   
        }
        else if (intervalType == MONTH) {
            groupId = {
                year: { $year: "$event_time" },
                month: { $month: "$event_time" }
            }   
        }
        else {
            groupId = {
                year: { $year: "$event_time" }
            }   
        }

        let groupPipeline = [
            {
                $group: {
                    _id: groupId,
                    event_count: { $sum: 1 }
                }
            }
        ]

        let pipeline = lookupPipeline.concat(matchPipeline, groupPipeline);

        let doc;
        try {
            doc = await EventModel.aggregate(pipeline).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return doc;  
    }








    // async findNumberOfIotEventWithAreaAndTime1() {
    //     EventModel.aggregate([
    //         {
    //             $lookup: {
    //                 from: "iotdevices",
    //                 localField: 'iot_device',
    //                 foreignField: '_id',
    //                 as: 'iot_device'
    //             }
    //         },
    //         {
    //             $unwind: "$iot_device"
    //         },
    //         {
    //             $lookup: {
    //                 from: "iotdevicemaps",
    //                 localField: 'iot_device._id',
    //                 foreignField: 'connect_iot',
    //                 as: 'iot_device_map'
    //             }
    //         },
    //         {
    //             $unwind: "$iot_device_map"
    //         },
    //         // {
    //         //     $lookup: {
    //         //         from: "iotdevicetypes",
    //         //         localField: "iot_device_type",
    //         //         foreignField: '_id',
    //         //         as: 'iot_device_type'
    //         //     }
    //         // },
    //         // {
    //         //     $unwind: "$iot_device_type"
    //         // },
    //         // {
    //         //     $lookup: {
    //         //         from: "areas",
    //         //         localField: 'area',
    //         //         foreignField: '_id',
    //         //         as: 'area'
    //         //     }
    //         // },
    //         // {
    //         //     $unwind: "$area"
    //         // },

    //         // {
    //         //     $match: { 
    //         //         $and: [
    //         //             { iot_device: { $exists: true, $ne: [null, undefined] } },
    //         //             { iot_device_map: { $exists: true, $ne: [null, undefined] } },
    //         //             { iot_device_type: { $exists: true, $ne: [null, undefined] } },
    //         //             // { event_time: { $gte: startTime, $lte: endTime } }
    //         //         ]
    //         //     }
    //         // },
    //         {
    //             $group: {
    //             //   _id: { area: "$area", iot_event_type: "$iot_event_type" },
    //             _id: { iot_device: "$iot_device" },
    //               event_count: { $sum: 1 }
    //             },
    //         },
    //     ])

    //     .exec((err, result) => {
    //         if (err) {
    //           console.log(err);
    //           return;
    //         }
    //         console.log(result);
    //         console.log(result[1]._id.iot_device)
    //     });
          
    // }
}

function newReportRepository() {
    return new ReportRepository();
}

module.exports.newReportRepository = newReportRepository;
