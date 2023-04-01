
class IotDeviceType {

    iotDeviceTypeName = undefined;
    imageUrl = undefined;

    accept(visitor, o, env) {
        return visitor.visitIotDeviceType(this, o, env);
    }

    getIotDeviceTypeName() {
        return this.iotDeviceTypeName;
    }

    getImageUrl() {
        return this.imageUrl;
    }

    setIotDeviceTypeName(iotDeviceTypeName) {
        this.iotDeviceTypeName = iotDeviceTypeName;
        return this;
    }

    setImageUrl(imageurl) {
        this.imageUrl = imageUrl;
        return this;
    }
}

function newIotDeviceType() {
    return new IotDeviceType();
}

module.exports.newIotDeviceType = newIotDeviceType;
