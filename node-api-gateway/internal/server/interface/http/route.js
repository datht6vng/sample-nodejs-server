const { Handler } = require("./handler");

Handler.prototype.initRoute = function() {
  this.app.get('/api/areas', this.areaController.getAllAreas);
  this.app.get('/api/areas/:id', this.areaController.getAreaById);
  this.app.post('/api/areas', this.areaController.createArea);
  this.app.put('/api/areas/:id', this.areaController.updateAreaById);
  this.app.delete('/api/areas/:id', this.areaController.deleteAreaById);

  this.app.get('/api/camera_maps', this.cameraMapController.getAllCameraMaps);
  this.app.get('/api/camera_maps/:id', this.cameraMapController.getCameraMapById);
  this.app.post('/api/camera_maps', this.cameraMapController.createCameraMap);
  this.app.put('/api/camera_maps/:id', this.cameraMapController.updateCameraMapById);
  this.app.delete('/api/camera_maps/:id', this.cameraMapController.deleteCameraMapById);

  this.app.get('/api/camera_types', this.cameraTypeController.getAllCameraTypes);
  this.app.get('/api/camera_types/:id', this.cameraTypeController.getCameraTypeById);
  this.app.post('/api/camera_types', this.cameraTypeController.createCameraType);
  this.app.put('/api/camera_types/:id', this.cameraTypeController.updateCameraTypeById);
  this.app.delete('/api/camera_types/:id', this.cameraTypeController.deleteCameraTypeById);

  this.app.get('/api/cameras', this.cameraController.getAllCameras);
  this.app.get('/api/cameras/:id', this.cameraController.getCameraById);
  this.app.post('/api/cameras', this.cameraController.createCamera);
  this.app.put('/api/cameras/:id', this.cameraController.updateCameraById);
  this.app.delete('/api/cameras/:id', this.cameraController.deleteCameraById);

  this.app.put('/api/cameras', this.cameraController.updateCamera);

  this.app.get('/api/event_types', this.eventTypeController.getAllEventTypes);
  this.app.get('/api/event_types/:id', this.eventTypeController.getEventTypeById);
  this.app.post('/api/event_types', this.eventTypeController.createEventType);
  this.app.put('/api/event_types/:id', this.eventTypeController.updateEventTypeById);
  this.app.delete('/api/event_types/:id', this.eventTypeController.deleteEventTypeById);

  this.app.get('/api/events', this.eventController.getAllEvents);
  this.app.get('/api/events/:id', this.eventController.getEventById);
  this.app.post('/api/events', this.eventController.createEvent);
  this.app.put('/api/events/:id', this.eventController.updateEventById);
  this.app.delete('/api/events/:id', this.eventController.deleteEventById);

  this.app.get('/api/iot_devices', this.iotDeviceController.getAllIotDevices);
  this.app.get('/api/iot_devices/:id', this.iotDeviceController.getIotDeviceById);
  this.app.post('/api/iot_devices', this.iotDeviceController.createIotDevice);
  this.app.put('/api/iot_devices/:id', this.iotDeviceController.updateIotDeviceById);
  this.app.delete('/api/iot_devices/:id', this.iotDeviceController.deleteIotDeviceById);

  this.app.get('/api/iot_device_maps', this.iotDeviceMapController.getAllIotDeviceMaps);
  this.app.get('/api/iot_device_maps/:id', this.iotDeviceMapController.getIotDeviceMapById);
  this.app.post('/api/iot_device_maps', this.iotDeviceMapController.createIotDeviceMap);
  this.app.put('/api/iot_device_maps/:id', this.iotDeviceMapController.updateIotDeviceMapById);
  this.app.delete('/api/iot_device_maps/:id', this.iotDeviceMapController.deleteIotDeviceMapById);

  this.app.get('/api/iot_device_types', this.iotDeviceTypeController.getAllIotDeviceTypes);
  this.app.get('/api/iot_device_types/:id', this.iotDeviceTypeController.getIotDeviceTypeById);
  this.app.post('/api/iot_device_types', this.iotDeviceTypeController.createIotDeviceType);
  this.app.put('/api/iot_device_types/:id', this.iotDeviceTypeController.updateIotDeviceTypeById);
  this.app.delete('/api/iot_device_types/:id', this.iotDeviceTypeController.deleteIotDeviceTypeById);

  this.app.post('/api/system_utilities', this.systemUtilityController.crudAllMapUtils);

  this.app.get('/api/reports', this.reportControlller.getReportByCondition);


  this.app.get('/api/users', this.userController.getAllUsers);
  this.app.get('/api/users/:id', this.userController.getUserById);
  this.app.post('/api/users', this.userController.createUser);
  this.app.put('/api/users/:id', this.userController.updateUserById);
  this.app.delete('/api/users/:id', this.userController.deleteUserById);

  this.app.post('/api/auth/login', this.userController.login);
  this.app.post('/api/auth/verify', this.userController.verifyToken);

  this.app.put('/api/stream_connections/:id', this.streamConnectionController.handleConnection);
}










// const handler = require("./handler");




// const grpc = require("@grpc/grpc-js");
// const { ProtoLoader } = require("../grpc/proto/ProtoLoader");
// const protoLoader = new ProtoLoader();




// handler.Handler.prototype.InitRoute = function () {
//   this.app.get("/metrics", this.metricsController.GetMetrics);
//   this.app.get("/api/health", this.healthContronller.GetHealth);



//   this.app.get("/api/iot_devices/", (req, res) => {
//     const packageDef = protoLoader.loadPackage("iot_device.proto");
    
//     const IotDeviceService = packageDef.IotDeviceService;
//     const clientStub = new IotDeviceService(    
//         "node-api-server:50051",
//         grpc.credentials.createInsecure()
//     );

//     clientStub.getAllDevices({}, (error, devices) => {
//       //implement your error logic here
//       console.log(devices);
//       return res.status(200).send({
//         status: 200,
//         data: devices,
//         message: "Success"
//       })
//     });


//   })




//   this.app.get("/api/iot_devices/:id", (req, res) => {
//     const packageDef = protoLoader.loadPackage("iot_device.proto");
    
//     const IotDeviceService = packageDef.IotDeviceService;
//     const clientStub = new IotDeviceService(    
//         "node-api-server:50051",
//         grpc.credentials.createInsecure()
//     );

//     clientStub.getDevice({ _id: req.params.id }, (error, device) => {
//       //implement your error logic here
//       console.log(device);
//       return res.status(200).send({
//         status: 200,
//         data: device,
//         message: "Success"
//       })
//     });

//   })


//   this.app.post("/api/iot_devices/", (req, res) => {
//     const packageDef = protoLoader.loadPackage("iot_device.proto");
    
//     const IotDeviceService = packageDef.IotDeviceService;
//     const clientStub = new IotDeviceService(    
//         "node-api-server:50051",
//         grpc.credentials.createInsecure()
//     );

//     clientStub.createDevice(req.body, (error, device) => {
//       //implement your error logic here
//       console.log(device);
//       return res.status(200).send({
//         status: 200,
//         data: device,
//         message: "Success"
//       })
//     });



//   })







//   this.app.get("/api/events/", (req, res) => {
//     const packageDef = protoLoader.loadPackage("event.proto");
    
//     const EventService = packageDef.EventService;
//     const clientStub = new EventService(    
//         "node-api-server:50051",
//         grpc.credentials.createInsecure()
//     );

//     clientStub.getAllEvents({}, (error, events) => {
//       //implement your error logic here
//       console.log(events);
//       return res.status(200).send({
//         status: 200,
//         data: events,
//         message: "Success"
//       })
//     });


//   })



//   this.app.get("/api/events/:id", (req, res) => {
//     const packageDef = protoLoader.loadPackage("event.proto");
    
//     const EventService = packageDef.EventService;
//     const clientStub = new EventService(    
//         "node-api-server:50051",
//         grpc.credentials.createInsecure()
//     );

//     clientStub.getEvent({ _id: req.params.id }, (error, event) => {
//       //implement your error logic here
//       console.log(event);
//       return res.status(200).send({
//         status: 200,
//         data: event,
//         message: "Success"
//       })
//     });

//   })


//   // ErrorController
//   this.app.use(this.errorController.ErrorNotFound);
//   this.app.use(this.errorController.ErrorController);
// };
