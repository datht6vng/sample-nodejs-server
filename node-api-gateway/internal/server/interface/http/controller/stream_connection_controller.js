const { Controller } = require("./controller");
const { newStreamConnectionHandler } = require("../../../service/grpc_client/handler/stream_connection_handler");

class StreamConnectionController extends Controller {
    constructor(streamConnectionHandler=newStreamConnectionHandler()) {
        super();
        this.handler = streamConnectionHandler;
        this.handleConnection = this.handleConnection.bind(this);
    }

    handleConnection(req, res, next) {
        let arg = {
            clientID: req.params.id
        };
        const action = req.query.action;
        if (action == "forceConnect") {
            this.handler.forceConnect(arg, this.success(res), this.failure(res));
        }
        else if (action == "forceDisconnect") {
            this.handler.forceDisconnect(arg, this.success(res), this.failure(res));
        }
        else {
            this.failure(res)(404, "Can not find action method");
        }
    }
}




function newStreamConnectionController() {
    return new StreamConnectionController();
}

module.exports.newStreamConnectionController = newStreamConnectionController;
