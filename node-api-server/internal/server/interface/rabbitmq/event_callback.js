const { socketIO } = require("../../socket_io/socket_io");
const { newReportService } = require("../../service/report_service");
const { config } = require("../../../../pkg/config/config")

const socketIOConfig = config.socket_io;
const EVENT_NEW = socketIOConfig.events.event_new;
const EVENT_VERIFIED = socketIOConfig.events.event_verified;

class EventCallback {
    constructor() {
        this.io = socketIO;
        this.reportService = newReportService();
    }

    async getAllEventRelationDetailsById(eventId) {
        const detail = await this.reportService.getAllEventRelationDetailsById(eventId);
        return detail;
    }

    notifyNewEventToClients(eventMessage) {
        this.io.emitToAllClients(EVENT_NEW, JSON.stringify(eventMessage));
    }

    notifyVerifiedEventToClients(eventMessage) {
        this.io.emitToAllClients(EVENT_VERIFIED, JSON.stringify(eventMessage));
    }

}

module.exports.EventCallback = EventCallback;
