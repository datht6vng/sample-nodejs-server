const express = require('express');
const EventModel = require('../models/event_model');
const EventRouter = express.Router();
// const { io } = require('../server')
// console.log("io get from server: ", io);
// const app = require('express')();
// const http = require('http').Server(app);
// const io = require('socket.io')(http, {
//     cors: {
//         origin: '*',
//     }
// });
let count = 1;
// io.on('connection', function (socket) {
//     console.log('Connected');

//     socket.on('msg_from_client', function (from, msg) {
//         console.log('Message is ' + from, msg);
//     })
//     socket.on('disconnect', function (msg) {
//         console.log('Disconnected');
//     })
// });

EventRouter.get('/events', async (req, res) => {
    const events = await EventModel.find({});
    res.status(200).json({
        "message": "Get all events",
        "data": events,
    })
})

EventRouter.post('/events', async (req, res) => {
    console.log("haha req.body: ", req.body);
    // console.log("get socket io from server: ", req.app.get("socketio"));
    // let io = req.app.get("socketio");
    const newEventDoc = {
        "iot_device": "6438e595e1e631269ddf0ab4",
        "iot_device_map": null,
        "camera_map": null,
        "ai_true_alarm": false,
        "human_true_alarm": false,
        "normal_image_url": '',
        "detection_image_url": '',
        "normal_video_url": '',
        "detection_video_url": '',
        "event_time": '2023-04-17T01:28:11Z',
        "event_status": 'human_verified',
        "created_at": (new Date()).toISOString(),
        "updated_at": (new Date()).toISOString(),
        "comment": 'Có comment rồi ' + count
    }

    try {
        let returnEventDoc = await EventModel.create(newEventDoc);
        // io.emit('msg_to_client', "message huhuhuhu", "ándnas");
        count += 1;
        res.status(200).json({
            "message": "Successfully create event",
            "data": returnEventDoc,
        })
    } catch (err) {
        res.status(500).json({
            "message": err
        })
    }

})

module.exports.EventRouter = EventRouter