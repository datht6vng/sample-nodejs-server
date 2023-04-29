const { config } = require("../../../../../pkg/config/config");
const amqp = require('amqplib');

const rabbitmqConf = config.rabbitmq;
const defaultUsername = rabbitmqConf.username;
const defaultPassword = rabbitmqConf.password;
const defaultHost = rabbitmqConf.host;
const defaultPort = rabbitmqConf.port;
const defaultVirtualHost = rabbitmqConf.virtual_host;
const scheme = rabbitmqConf.scheme;

class RabbitMQConection {
    constructor(username=defaultUsername, password=defaultPassword, host=defaultHost, port=defaultPort, virtualHost=defaultVirtualHost) {
        this.username = username;
        this.password = password;
        this.host = host;
        this.port = port;
        this.virtualHost = virtualHost;
        this.scheme = scheme;

    }

    async init() {
        this.connection = await amqp.connect(`${this.scheme}://${this.username}:${this.password}@${this.host}:${this.port}${this.virtualHost}`);
        return this.connection;
    }

    getConnection() {
        return this.connection;
    }
}

function newRabbitMQConnection() {
    return new RabbitMQConection();
}

module.exports.newRabbitMQConnection = newRabbitMQConnection;
