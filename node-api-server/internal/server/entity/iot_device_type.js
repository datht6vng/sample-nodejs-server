
class IotDeviceType {

    id = undefined;
    iotDeviceTypeName = undefined;
    imageUrl = undefined;
    description = undefined;

    accept(visitor, o, env) {
        return visitor.visitIotDeviceType(this, o, env);
    }

    getId() {
        return this.id;
    }

    getIotDeviceTypeName() {
        return this.iotDeviceTypeName;
    }

    getImageUrl() {
        return this.imageUrl;
    }

    getDescription() {
        return this.description;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    setIotDeviceTypeName(iotDeviceTypeName) {
        this.iotDeviceTypeName = iotDeviceTypeName;
        return this;
    }

    setImageUrl(imageUrl) {
        this.imageUrl = imageUrl;
        return this;
    }

    setDescription(description) {
        this.description = description;
        return this;
    }
}

function newIotDeviceType() {
    return new IotDeviceType();
}

module.exports.newIotDeviceType = newIotDeviceType;
