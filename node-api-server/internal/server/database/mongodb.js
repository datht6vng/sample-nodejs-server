const mongoose = require('mongoose');

const defaultUser = 'root';
const defaultPassword = '12345';
const defaultHost = 'mongodb';
const defaultPort = '27017';
const defaultDbName = 'iot_security_app';
const defaultOptions = {
    useNewUrlParser: true, 
    useUnifiedTopology: true
}


class MongoDb {
    constructor(user=defaultUser, password=defaultPassword, host=defaultHost, port=defaultPort, db = defaultDbName,  options=defaultOptions) {
        this.user = user;
        this.password = password;
        this.host = host;
        this.port = port;
        this.db = db;
        this.options = options;
    }

    
}

MongoDb.prototype.start = async function() {
    const uri = `mongodb://${this.user}:${this.password}@${this.host}:${this.port}/${this.db}?authSource=admin`;
    try {
        await mongoose.connect(uri, this.options);
        console.log(`MongoDB is connect on ${uri}`);
    }
    catch(error) {
        console.log(error);
    }
}


module.exports.MongoDb = MongoDb;


