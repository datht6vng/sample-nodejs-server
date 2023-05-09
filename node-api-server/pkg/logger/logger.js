const { createLogger, format, transports } = require('winston');

const logFormat = format.combine(
    format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
    format.printf(info => `${[info.timestamp]} - [${info.level.toUpperCase()}]: ${info.message}`),
)

const consoleTransport = new transports.Console(
    {
        format: logFormat
    }
)

const fileTransport = new transports.File(
    {
        filename: 'logs/server.log',
        format: logFormat
    }
)

const logConfiguration = {
    transports: [consoleTransport, fileTransport]
};

const logger = createLogger(logConfiguration);

module.exports.logger = logger;
