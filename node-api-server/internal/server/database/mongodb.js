const mongoose = require('mongoose');

const { config } = require("../../../pkg/config/config");
const { logger } = require("../../../pkg/logger/logger");

class MongoDB {
    constructor() {     
        this.conf = config.database.mongodb;
        this.options = {
            authSource: this.conf.options.auth_source,
            useNewUrlParser: this.conf.options.use_new_url_parser, 
            useUnifiedTopology: this.conf.options.use_unified_topology
        }
    }

    async start(user=this.conf.user, password=this.conf.password, host=this.conf.host, port=this.conf.port, db=this.conf.db_name, options=this.conf.options) {
        const url = `mongodb://${user}:${password}@${host}:${port}/${db}`;
        try {
            await mongoose.connect(url, this.options);
            logger.info(`MongoDB is connected on ${url}`);
        }
        catch(error) {
            logger.error(error);
        }
    }
    
}

function newMongoDB() {
    return new MongoDB();
}

module.exports.newMongoDB = newMongoDB;
