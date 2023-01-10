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
  constructor(io, URL=defaultUrl, config=defaultClientConfig, topics=defaultTopics) {
    this.io = io;
    this.URL = URL;
    this.config = config;
    this.topics = topics;
    this.client = null;
  }
  async start() {
    const io = this.io;
    this.client = await mqtt.connect(this.URL, this.config);
    const client = this.client;
    const topics = this.topics;
    this.client.on('connect', function () {
      client.subscribe(topics, { qos: 1 });
    });
    this.client.on('message', async function (topic, message) {
      console.log('________________Receive data from MQTT broker_____________');

      console.log("Topic: ", topic);
      console.log('Received message: ',  message.toString());



      let s = message = message.toString();
      if (topic == 'home/alarm/zone_open') {
        s = s.split('|')
        for (let i = 0; i < s.length; i++) {
          s[i] = s[i].split(' ');
        }
        let event = s[0][1];
        let zone = s[1][2];
        let area = s[2][2];
        if (isNaN(area)) {
          area = area.substring(0, area.length - 1);
        }

        const IotDevice = require("../../models/iot_device");
        const Event = require("../../models/event");
        let device = await IotDevice.findOne({ config_zone: zone });

        let newEvent = {

        }
        if (device) {
          newEvent.iot_device_id = device._id;
          newEvent.area_id = device.area_id;
          newEvent.true_alarm = true;
          newEvent.status = "Chưa xử lý";
          newEvent.image_link = "https://videohive.img.customer.envatousercontent.com/files/216704261/Security%20Camera%20Recording%20Screen%20590x332.jpg?auto=compress%2Cformat&fit=crop&crop=top&max-h=8000&max-w=590&s=9cb25128543c6ed465ba07d7d4de85f4";
          newEvent.event = event;
          newEvent.zone = zone;
          newEvent.area = area;
          newEvent.event_time = new Date();

          newEvent = await Event.create(newEvent);
          newEvent = await Event.findOne({ _id: newEvent._id }).populate('iot_device_id').populate('area_id');
          io.emit('iot_event', newEvent);
        }
      }
      

    });
  }
}

module.exports.MQTTSubscriber = MQTTSubscriber;

