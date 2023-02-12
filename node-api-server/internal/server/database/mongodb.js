const mongoose = require('mongoose');

const { config } = require("../../../pkg/config/config");

const mongodb = config.database.mongodb;

const defaultUser = mongodb.user;
const defaultPassword = mongodb.password;
const defaultHost = mongodb.host;
const defaultPort = mongodb.port;
const defaultDbName = mongodb.db_name;
const defaultOptions = {
    authSource: mongodb.options.auth_source,
    useNewUrlParser: mongodb.options.use_new_url_parser, 
    useUnifiedTopology: mongodb.options.use_unified_topology
}


class MongoDb {
    constructor(user=defaultUser, password=defaultPassword, host=defaultHost, port=defaultPort, db=defaultDbName,  options=defaultOptions) {
        this.user = user;
        this.password = password;
        this.host = host;
        this.port = port;
        this.db = db;
        this.options = options;
    }

    
}

MongoDb.prototype.start = async function() {
    const uri = `mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.db}`;
    try {
        await mongoose.connect(uri, this.options);
        console.log(`MongoDB is connected on ${uri}`);
    }
    catch(error) {
        console.log(error);
    }
}

function newMongoDb(user=defaultUser, password=defaultPassword, host=defaultHost, port=defaultPort, db=defaultDbName,  options=defaultOptions) {
    return new MongoDb(user, password, host, port, db, options);
}

module.exports.MongoDb = MongoDb;
module.exports.newMongoDb = newMongoDb;
