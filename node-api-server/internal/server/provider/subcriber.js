var mqtt = require('mqtt');
var url  = `mqtt://${process.env.BROKER_HOST}:1883`;

var client = mqtt.connect(url, { 
  clientId: 'mqtt-sub-test-4-', 
  clean: false,
  connectTimeout: 4000,
  username: 'guest',
  password: 'guest',
  reconnectPeriod: 1000
 });
client.on('connect', function () {
  client.subscribe('airasoul', { qos: 1 });
});

client.on('message', function (topic, message) {
  console.log('received message ',  message.toString());
});
