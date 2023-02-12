const handler = require("./handler");




const { createTestArea, getTestArea } = require("../../database/create_test_data");
const { createTestCamera, getTestCamera } = require("../../database/create_test_data");



handler.Handler.prototype.initRoute = function () {
  this.app.get("/metrics", this.metricsController.GetMetrics);
  this.app.get("/api/health", this.healthContronller.GetHealth);


  this.app.get("/users", (req, res) => {
    console.log('Request received ////////////////////////');
    return res.json({
      test: "success"
    });
  })







  this.app.get("/api/test/create_area", (req, res) => {
    
    
    createTestArea();
    
    return res.send("Success create area");
  })

  this.app.get("/api/test/get_all_area", (req, res) => {
    
    
    const data = getTestArea();
    console.log(data);
    
    return res.send(data);
  })


  this.app.get("/api/test/create_camera", (req, res) => {
    
    
    createTestCamera();
    
    return res.send("Success create camera");
  })


  this.app.get("/api/test/get_all_camera", (req, res) => {
    
    
    const data = getTestCamera();
    console.log(data);
    
    return res.send(data);
  })






  // ErrorController
  this.app.use(this.errorController.ErrorNotFound);
  this.app.use(this.errorController.ErrorController);
};
