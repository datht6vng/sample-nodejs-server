let mqtt = require('mqtt');
let defaultUrl = `mqtt://message-broker-server:1883`;
let defaultClientConfig = { 
  clientId: 'mqtt-sub-test-project-', 
  clean: false,
  connectTimeout: 4000,
  username: 'guest',
  password: 'guest',
  reconnectPeriod: 1000
}

let defaultTopics = ['home/alarm/zone_open', 'home/alarm/zone_ok']

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


class MQTTSubscriber {
  constructor(URL=defaultUrl, config=defaultClientConfig, topics=defaultTopics) {
    this.URL = URL;
    this.config = config;
    this.topics = topics;
    this.client = null;
  }
  async start() {
    this.client = await mqtt.connect(this.URL, this.config);
    const client = this.client;
    const topics = this.topics;
    this.client.on('connect', function () {
      client.subscribe(topics, { qos: 1 });
    });
    this.client.on('message', function (topic, message) {
      console.log('________________Receive data from MQTT broker_____________');
      console.log("Topic: ", topic);
      console.log('Received message: ',  message.toString());
      console.log('Received message JSON: ',  JSON.parse(message));
    });
  }
}

module.exports.MQTTSubscriber = MQTTSubscriber;

