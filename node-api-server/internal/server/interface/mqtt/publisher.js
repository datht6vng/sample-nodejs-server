var mqtt = require('mqtt');
var url  = 'mqtt://message-broker-server:1883';

var payload = "Event: 1 | Zone: 03 | Area: 1";

var client = mqtt.connect(url);

client.on('connect', function () {
  client.publish('home/alarm/zone_open', JSON.stringify(payload), { qos: 1 }, function() {
    client.end();
    process.exit();
  });
});



