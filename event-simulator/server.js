const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
	cors: {
		origin: '*',
	}
});
const bodyParser = require('body-parser');
const db = require('./database/connection');
const { EventRouter } = require('./routes/event');
const EventModel = require('./models/event_model');
const { genObjectId } = require('./utils/genObjectId');
require('dotenv').config();

io.on('connection', function (socket) {
	console.log('Connected');

	socket.on('msg_from_client', function (from, msg) {
		console.log('Message is ' + from, msg);
	})
	socket.on('disconnect', function (msg) {
		console.log('Disconnected');
	})
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
http.listen(process.env.PORT, function () {
	console.log(`Listening to port ${process.env.PORT}`);
})

// app.use('/api/', EventRouter)
// app.set('socketio', io);

let count = 1;
app.post('/api/addEventSocket', async function (req, res) {
	const newEventDoc = {
		"_id": genObjectId(),
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
		io.emit('msg_to_client', 'client', newEventDoc);
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

// let count = 0;
// setInterval(function () {
// 	let eventMessage = {
// 		"id": count,
// 		"key": count,
// 		"iot_device": "6438e595e1e631269ddf0ab4",
// 		"camera": "",
// 		"ai_true_alarm": false,
// 		"human_true_alarm": false,
// 		"normal_image_url": "",
// 		"normal_video_url": "",
// 		"detection_image_url": "",
// 		"detection_video_url": "",
// 		"event_time": "2023-04-10T08:45:11Z",
// 		"event_status": "wait_for_processing",
// 		"created_at": "2023-04-10T08:45:11Z",
// 		"updated_at": "2023-04-10T08:45:11Z",
// 		"iot_device_map": "",
// 		"camera_map": "",
// 		"comment": "Sự kiện này chưa có comment"
// 	}
// 	// let eventMessage = { "id": count, "key": count, "zone": 64, "comment": "ABC1" + count, "true_alarm": true, "created_at": Date.now(), "confirm_status": "done" }
// 	// io.emit('msg_to_client', 'client', 'test msg' + count);
// 	io.emit('msg_to_client', 'client', eventMessage);
// 	count++;
// }, 3000)
