const Cam = require("onvif").Cam;

class CameraRotationService {
  getConnection(cameraConfig) {
    return new Promise((resolve, reject) => {
      new Cam(cameraConfig, function (err) {
        if (err) {
          reject(err);
        }
        resolve(this);
      });
    });
  }

  async relativeMove(connection, x, y, z, zoom) {
    return new Promise((resolve, reject) => {
      connection.relativeMove({
          x: x,
          y: y,
          zoom: zoom,
        }, (err) => {
          if (err) {
            reject(err);
          }
          resolve(this);
        });
    });
  }

  async absoluteMove(cameraConfig, x, y, z, zoom) {
    const connection = await this.getConnection(cameraConfig);
    return new Promise((resolve, reject) => {
      connection
        .absoluteMove({
          x: x,
          y: y,
          zoom: zoom,
        }, (err) => {
          if (err) {
            reject(err);
          }
          resolve(this);
        });
    });
  }

  async continuousMove(cameraConfig, x, y, z, zoom) {
    const connection = await this.getConnection(cameraConfig);
    return new Promise((resolve, reject) => {
        connection
          .continuousMove({
            x: x,
            y: y,
            zoom: zoom,
          }, (err) => {
            if (err) {
              reject(err);
            }
            resolve(this);
          });
    });
  }

  async stop(cameraConfig) {
    const connection = await this.getConnection(cameraConfig);
    return new Promise((resolve, reject) => {
        connection.stop({}, (err) => {
            if (err) {
              reject(err);
            }
            resolve(this);
        });
    });
  }

  async getStatus(cameraConfig, options) {
    const connection = await this.getConnection(cameraConfig);
    return new Promise((resolve, reject) => {
      console.log(options)
      connection.getStatus(options, (err, object)=>{
          if (err) {
              reject(err);
          }
          resolve(object);
      });
  })
  }

  async getPresets(cameraConfig) {
    const connection = await this.getConnection(cameraConfig);
    return new Promise((resolve, reject) => {
      connection.getPresets({}, (err, object) => {
        if (err) {
          reject(err);
        }
        resolve(object);
      });
    });
  }

  async gotoPreset(cameraConfig, preset, profileToken) {
    const connection = await this.getConnection(cameraConfig);
    connection.gotoPreset({
      preset: preset,
    });
  }

  async setHomePosition(cameraConfig, options) {
    const connection = await this.getConnection(cameraConfig);
    return new Promise((resolve, reject) => {
        connection.setHomePosition(options, (err)=> {
            if (err) {
                reject(err);
              }
              resolve(this);
        });
    })
  }

  async gotoHomePosition(connection, options) {
    return new Promise((resolve, reject) => {
        connection.gotoHomePosition(options, (err)=> {
              if (err) {
                  reject(err);
                }
                connection.getStatus({}, (err, object)=>{
            if (err) {
              reject(err);
            }
            resolve(object);
          })
          });
      })
  }
}

function newCameraRotationService() {
  return new CameraRotationService();
}

module.exports.newCameraRotationService = newCameraRotationService;
