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
let idUpdated = '';
app.post('/api/addEventSocket', async function (req, res) {
	idUpdated = genObjectId();
	const newEventDoc = {
		"_id": idUpdated,
		// "iot_device": "6438e595e1e631269ddf0ab4",
		// "iot_device_map": null,
		// "camera_map": null,
		"camera": "64661ac56e2fe5c1c9ab9bd3",
		"camera_map": "64661ad7dfa269a68bb7e549",
		"ai_true_alarm": false,
		"human_true_alarm": false,
		// "normal_image_url": 'http://localhost:5005/static/general/image/20230518-200251-3eb6643197e94e5e8d83c898e1d2510a.jpg',
		// "detection_image_url": 'http://localhost:5005/static/detection/image/20230518-200251-40d2773ff04f4c67b837f9f6a4645159.jpg',
		// "normal_video_url": 'http://localhost:8080/videos/64661ac56e2fe5c1c9ab9bd3/1684413708817366500/record_7.mp4',
		// "detection_video_url": 'http://localhost:8080/videos/64661ac56e2fe5c1c9ab9bd3/1684413708817366500/record_7.mp4',
		"normal_image_url": 'https://cameraanhung.com/storage/uploads/2022/10/960d39ac-6488-49d9-98b6-cc837e7c653e/Camera-PTZ-la-gi-co-nen-dung-khong.jpg?width=960&height=600',
		// "detection_image_url": 'http://localhost:5005/static/detection/image/20230518-200251-40d2773ff04f4c67b837f9f6a4645159.jpg',
		"normal_video_url": 'http://localhost:8080/videos/64661ac56e2fe5c1c9ab9bd3/1684413708817366500/record_7.mp4',
		// "detection_video_url": 'http://localhost:8080/videos/64661ac56e2fe5c1c9ab9bd3/1684413708817366500/record_7.mp4',
		"event_time": '2023-04-17T01:28:11Z',
		"event_status": 'wait_for_processing',
		"created_at": (new Date()).toISOString(),
		"updated_at": (new Date()).toISOString(),
		"comment": 'Có comment rồi ' + count
	}



	try {
		let returnEventDoc = await EventModel.create(newEventDoc);
		io.emit('event_new', 'client', newEventDoc);
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



app.post('/api/addEventSocket2', async function (req, res) {
	const newEventDoc = {
		// "_id": genObjectId(),
		// "iot_device": "6438e595e1e631269ddf0ab4",
		// "iot_device_map": null,
		// "camera_map": null,
		"camera": "64661ac56e2fe5c1c9ab9bd3",
		"camera_map": "64661ad7dfa269a68bb7e549",
		"ai_true_alarm": false,
		"human_true_alarm": false,
		"normal_image_url": 'https://cameraanhung.com/storage/uploads/2022/10/960d39ac-6488-49d9-98b6-cc837e7c653e/Camera-PTZ-la-gi-co-nen-dung-khong.jpg?width=960&height=600',
		"detection_image_url": 'https://img.etimg.com/thumb/msid-95169733,width-1200,height-900,imgsize-53448,resizemode-8,quality-100/tech/technology/blurring-lines-between-sci-fi-and-reality-why-ai-needs-responsible-policy-intervention.jpg',
		"normal_video_url": 'http://localhost:8080/videos/64661ac56e2fe5c1c9ab9bd3/1684413708817366500/record_7.mp4',
		"detection_video_url": 'http://localhost:8080/videos/64661ac56e2fe5c1c9ab9bd3/1684413708817366500/record_7.mp4',
		"event_time": '2023-04-17T01:28:11Z',
		"event_status": 'wait_for_processing',
		"created_at": (new Date()).toISOString(),
		"updated_at": (new Date()).toISOString(),
		"comment": 'Có comment rồi ' + count
	}


	// const eventDoc = this.toDatabaseConverter.visit(eventEntity);
	// const filter = {
	// 	_id: eventId.getValue()
	// }
	// let newEventDoc;
	// try {
	// 	newEventDoc = await EventModel.findOneAndUpdate(filter, eventDoc, { new: true }); // set new to true to return new document after update
	// }
	// catch (err) {
	// 	throw newInternalServerError("Database error", err);
	// }
	// return this.fromDatabaseConverter.visit(newEvent(), newEventDoc);


	const filter = {
		_id: idUpdated
	}
	try {
		let returnEventDoc = await EventModel.findOneAndUpdate(filter, newEventDoc, { new: true });;
		io.emit('event_verified', 'client', returnEventDoc);
		count += 1;
		res.status(200).json({
			"message": "Successfully update event verified",
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
