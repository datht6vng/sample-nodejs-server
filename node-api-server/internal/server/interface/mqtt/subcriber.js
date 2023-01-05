let mqtt = require('mqtt');
let defaultUrl = `mqtt://${process.env.BROKER_HOST}:1883`;
let defaultClientConfig = { 
  clientId: 'mqtt-sub-test-4-', 
  clean: false,
  connectTimeout: 4000,
  username: 'guest',
  password: 'guest',
  reconnectPeriod: 1000
}

let defaultTopics = ['airasoul']

// var client = mqtt.connect(url, { 
//   clientId: 'mqtt-sub-test-4-', 
//   clean: false,
//   connectTimeout: 4000,
//   username: 'guest',
//   password: 'guest',
//   reconnectPeriod: 1000
//  });
// client.on('connect', function () {
//   client.subscribe(['airasoul'], { qos: 1 });
// });

// client.on('message', function (topic, message) {
//   console.log('received message ',  message.toString());
// });


class MQTTSubcriber {
  constructor(URL=defaultUrl, config=defaultClientConfig, topics=defaultTopics) {
    this.URL = URL;
    this.config = config;
    this.topics = topics;
    this.client = null;
  }
  start() {
    this.client = mqtt.connect(this.URL, this.config);
    this.client.on('connect', function () {
      client.subscribe(this.topics, { qos: 1 });
    });
    this.client.on('message', function (topic, message) {
      console.log('received message ',  message.toString());
    });
  }
}

module.exports.MQTTSubcriber = MQTTSubcriber;

