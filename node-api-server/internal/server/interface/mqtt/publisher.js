var mqtt = require('mqtt');
var url  = 'mqtt://192.168.1.37:1883';

var payload = {
  deviceId : '8675309'
};

var client = mqtt.connect(url);

client.on('connect', function () {
  client.publish('airasoul', JSON.stringify(payload), { qos: 1 }, function() {
    client.end();
    process.exit();
  });
});



