const { createLogger, format, transports } = require('winston');


const consoleTransport = new transports.Console(
    {
        format:format.combine(
            format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
            format.align(),
            format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
        )   
    }
)

const fileTransport = new transports.File(
    {
        filename: '../../logs/server.log',
        format:format.combine(
            format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
            format.align(),
            format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
        )
    }
)

const logConfiguration = {
    transports: [consoleTransport, fileTransport]
};

const logger = createLogger(logConfiguration);

module.exports.logger = logger;
