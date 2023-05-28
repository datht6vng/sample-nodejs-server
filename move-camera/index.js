var Cam = require("onvif").Cam;

const cameraConfig = {
  hostname: "tris.ddns.net",
  username: "admin",
  password: "Dientoan@123",
  port: 8064,
};

const connect = (cameraConfig) => {
  return new Promise((resolve, reject) => {
    const camera = new Cam(cameraConfig, function (err) {
      if (err) {
        reject(err);
      }
      resolve(camera);
    });
  });
};
// Cần thêm cái hàm nào k có demo trong này: https://www.npmjs.com/package/onvif, phần Cam
// Onvif đều có callback nha, mấy cái hàm phía dưới của cái object cam cần thì truyền callback vô
// Onvif không có trục z, quay x,y với zoom thôi, để z nếu có kết nối camera thường thì xài được
// [-1, 1]



const absoluteMove = (camera, {
    x,y,z,zoom 
}) => {
    camera.absoluteMove({
        x: x,
        y: y,
        zoom: zoom
    });
}
// Quay liên tục
const continuousMove = (camera, {
    x,y,z,zoom 
}) => {
    camera.continuousMove({
        x: x,
        y: y,
        zoom: zoom
    });
}
// Dừng quay liên tục
const stop = (camera) => {
    camera.stop()
}

const getStatus = (camera) => {
    return new Promise((resolve, reject) => {
        camera.getStatus((object, err)=>{
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(object);
        });
    })
}

const getPresets = (camera) => {
    return new Promise((resolve, reject) => {
        camera.getPresets((object, err)=>{
            if (err) {
                console.log(err);
                reject(err);
            }
            resolve(object);
        });
    })
}

const gotoPreset = (camera, {
    preset,profileToken
}) => {
    camera.gotoPreset({preset: preset});
}

const setHomePosition = (camera, options) => {
    camera.setHomePosition(options);
};

const gotoHomePosition = (camera, options) => {
    camera.gotoHomePosition({}, (err)=>{});
};

const relativeMove = (camera, {
    x,y,z,zoom 
}) => {
    camera.relativeMove({
        x: x,
        y: y,
        zoom: zoom
    }, err=>{
        console.log(err);
    });
}

async function relativeMove2(connection, {x, y, z, zoom}) {
    return new Promise((resolve, reject) => {
      connection.relativeMove({
          x: x,
          y: y,
          zoom: zoom,
        }, (err)=>{
            console.log(err)
            if (err) reject(err);
            resolve(this);
        });
    });
  }

const main = async () => {
    const camera = await connect(cameraConfig);
    // await relativeMove2(camera, {x: 0.15, y: 0, z:0, zoom: 0}) // Bình thường là cái tọa độ này
    relativeMove(camera, {x: 0.21, y: 0, z:0, zoom: 0})
    // gotoHomePosition(camera, {});
    // setHomePosition(camera, {});
};
main();
