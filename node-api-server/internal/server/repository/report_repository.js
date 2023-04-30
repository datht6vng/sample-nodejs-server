const mongoose = require('mongoose');
const EventModel = require("../model/event_model");

const { newInternalServerError } = require("../entity/error/internal_server_error");


const DATE = "date";
const MONTH = "month";
const WEEK = "week";
const YEAR = "year";
const AI_VERIFIED_STATUS = "ai_verified";


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

    toMongooseId(id) {
        return mongoose.Types.ObjectId(id);
    }

    toDate(date) {
        return new Date(date);
    }

    async getAllEventRelationDetailsById(eventId) {
        eventId = eventId.getValue();
        let matchPipeline = [
            {
                $match: {
                    _id: { $eq: eventId }
                }
            }
        ];

        let pipeline = lookupPipeline.concat(matchPipeline);

        let doc;
        try {
            doc = await EventModel.aggregate(pipeline).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return doc;
    }


    async findAllEventStatisticCount() {
        let doc;
        try {
            const totalEvent = await EventModel.count({});
            const aiVerifiedEvent = await EventModel.count({
                event_status: {
                    $eq: AI_VERIFIED_STATUS
                }
            });
            const aiTrueAlarmEvent = await EventModel.count({
                ai_true_alarm: {
                    $eq: true
                }
            });
            const aiFalseAlarmEvent = await EventModel.count({
                ai_true_alarm: {
                    $eq: false
                }
            })

            doc = {
                total_event_count: totalEvent,
                ai_verified_event_count: aiVerifiedEvent,
                ai_true_alarm_event_count: aiTrueAlarmEvent,
                ai_false_alarm_event_count: aiFalseAlarmEvent
            }
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return doc; 
    }

    
    async findNumberOfIotEventByType(areaId, startTime, endTime) {
        areaId = areaId.getValue();
        let lookupPipeline = this.getIotEventLookupPipeline();
        let matchPipeline = [
            {
                $match: {
                    $and: [
                        { "area._id": { $eq: this.toMongooseId(areaId) } },
                        { event_time: { $gte: this.toDate(startTime), $lte: this.toDate(endTime) } }
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
                        { "area._id": { $eq: this.toMongooseId(areaId) } },
                        { event_time: { $gte: this.toDate(startTime), $lte: this.toDate(endTime) } }
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
                        { "area._id": { $eq: this.toMongooseId(areaId) } },
                        { "iot_device_type._id": { $eq: this.toMongooseId(iotDeviceTypeId) } },
                        { event_time: { $gte: this.toDate(startTime), $lte: this.toDate(endTime) } }
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
}

function newReportRepository() {
    return new ReportRepository();
}

module.exports.newReportRepository = newReportRepository;
