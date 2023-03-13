const mongoose = require('mongoose');

const { config } = require("../../../pkg/config/config");

class MongoDB {
    constructor() {     
        this.conf = config.database.mongodb;
        this.options = {
            authSource: this.conf.options.auth_source,
            useNewUrlParser: this.conf.options.use_new_url_parser, 
            useUnifiedTopology: this.conf.options.use_unified_topology
        }
    }

    
}

MongoDB.prototype.start = async function(user=this.conf.user, password=this.conf.password, host=this.conf.host, port=this.conf.port, db=this.conf.db_name, options=this.conf.options) {
    const url = `mongodb://${user}:${password}@${host}:${port}/${db}`;
    try {
        await mongoose.connect(url, this.options);
        console.log(`MongoDB is connected on ${url}`);
    }
    catch(error) {
        console.log(error);
    }
}

function newMongoDB() {
    return new MongoDB();
}

module.exports.newMongoDB = newMongoDB;
