const handler = require("./handler");
handler.Handler.prototype.InitRoute = function () {
  this.app.get("/metrics", this.metricsController.GetMetrics);
  this.app.get("/api/health", this.healthContronller.GetHealth);



  this.app.get("/api/iot_devices/", (req, res) => {

    const grpc = require("@grpc/grpc-js");
    const { ProtoLoader } = require("../grpc/proto/ProtoLoader");
    const protoLoader = new ProtoLoader();
    
    const packageDef = protoLoader.loadPackage("iot_device.proto");
    
    const IotDeviceService = packageDef.IotDeviceService;
    const clientStub = new IotDeviceService(    
        "node-api-server:50051",
        grpc.credentials.createInsecure()
    );

    let data = clientStub.getAllDevices({}, (error, devices) => {
      //implement your error logic here
      console.log(devices);
      return devices;
    });
    return res.status(400).send({
      status: 400,
      data: data,
      message: "Success"
    })



  })



  // ErrorController
  this.app.use(this.errorController.ErrorNotFound);
  this.app.use(this.errorController.ErrorController);
};
