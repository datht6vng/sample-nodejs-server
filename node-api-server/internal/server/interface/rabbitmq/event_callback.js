const { newProducer } = require("./producer");
const { newExchange } = require("./handler/exchange");
const { newQueue } = require("./handler/queue");
// const { newReportService } = require("../../service/report_service");
const { newToProtobufConverter } = require("../../data_converter/to_protobuf_converter");
const { newErrorHandler } = require("../../error/error_handler");

class EventCallback {
    constructor() {
        // this.reportService = newReportService();
        this.toProtobufConverter = newToProtobufConverter();
        this.errorHandler = newErrorHandler();

        this.notifyNewEventToClients = this.notifyNewEventToClients.bind(this);
        this.notifyVerifiedEventToClients = this.notifyVerifiedEventToClients.bind(this);
    }

    // async getAllEventRelationDetailsById(eventId) {
    //     const detail = await this.reportService.getAllEventRelationDetailsById(eventId);
    //     return detail;
    // }
    getProducer() {
        const argExchange = newExchange("event_notification");
        const argQueue = newQueue("");
        const producer = newProducer(argExchange, argQueue);
        return producer;
    }

    notifyNewEventToClients(eventMessage) {
        const producer = this.getProducer();
        producer.produceMessage("event.new.random", Buffer.from(JSON.stringify(eventMessage)));
    }

    notifyVerifiedEventToClients(eventMessage) {
        const producer = this.getProducer();
        producer.produceMessage("event.verified.random", Buffer.from(JSON.stringify(eventMessage)));

    }

}

module.exports.EventCallback = EventCallback;
