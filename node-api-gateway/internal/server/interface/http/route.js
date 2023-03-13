const { Handler } = require("./handler");

Handler.prototype.initRoute = function() {
  this.app.get('/api/areas', this.areaController.getAllAreas);
  this.app.post('/api/areas', this.areaController.createArea);
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
