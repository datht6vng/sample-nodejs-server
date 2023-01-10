const Area = require("../models/area");
const Camera = require("../models/camera");
const IotDevice = require("../models/iot_device");
const Event = require("../models/event");
const camera = require("../models/camera");


function createTestArea() {
    const areas = [
        {
            _id: "63bba2c30953043cd7d792a3",
            area_name: "Khu vực 1",
            address: "Địa chỉ khu vực 1"
        },
        {
            _id: "63bba2c30953043cd7d792a4",
            area_name: "Khu vực 2",
            address: "Địa chỉ khu vực 2"
        },
        {
            _id: "63bba2c30953043cd7d792a5",
            area_name: "Khu vực 3",
            address: "Địa chỉ khu vực 3"
        }
    ]
    
    Area.insertMany(areas).then(function(){
        console.log("Area test datas are inserted successfully")  // Success
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
            _id: "73bba2c30953043cd7d792a3",
            camera_name: "Camera 101",
            status: "Đang hoạt động",
            area_id: "63bba2c30953043cd7d792a3"
        },
        {
            _id: "73bba2c30953043cd7d792a4",
            camera_name: "Camera 102",
            status: "Đang hoạt động",
            area_id: "63bba2c30953043cd7d792a4"
        },
        {
            _id: "73bba2c30953043cd7d792a5",
            camera_name: "Camera 102",
            status: "Đang hoạt động",
            area_id: "63bba2c30953043cd7d792a4"
        },
    ]
    Camera.insertMany(cameras).then(function(){
        console.log("Camera test datas are inserted successfully")  // Success
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


