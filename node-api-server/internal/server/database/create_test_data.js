const Area = require("../models/area");
const Camera = require("../models/camera");
const IotDevice = require("../models/iot_device");
const Event = require("../models/event");
const camera = require("../models/camera");


function createTestArea() {
    const areas = [
        {
            _id: "63bba2c30953043cd7d792a3",
            area_name: "Tang 1",
            address: "Dia chi tang 1"
        },
        {
            _id: "63bba2c30953043cd7d792a4",
            area_name: "Tang 2",
            address: "Dia chi tang 2"
        },
        {
            _id: "63bba2c30953043cd7d792a5",
            area_name: "Tang 3"
        }
    ]
    
    Area.insertMany(areas).then(function(){
        console.log("Area data inserted")  // Success
    }).catch(function(error){
        console.log(error)      // Failure
    });
}


async function getTestArea() {
    const areas = await Area.find();
    console.log(areas);
    return areas;
}

function createTestCamera() {
    const cameras = [
        {
            camera_name: "Camera 1",
            area_id: "63bba194752979d4dc630f24"
        },
        {
            camera_name: "Camera 2",
            area_id: "63bba194752979d4dc630f24"
        }
    ]
    Camera.insertMany(cameras).then(function(){
        console.log("Camera data inserted")  // Success
    }).catch(function(error){
        console.log(error)      // Failure
    });
}


async function getTestCamera() {
    const cameras = await Camera.find().populate('area_id');
    console.log(cameras);
    return cameras;
}


module.exports.createTestArea = createTestArea;
module.exports.getTestArea = getTestArea;
module.exports.createTestCamera = createTestCamera;
module.exports.getTestCamera = getTestCamera;


