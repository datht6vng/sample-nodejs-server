
class CameraType {
    id = undefined;
    cameraTypeName = undefined;
    imageUrl = undefined;

    accept(visitor, o, env) {
        return visitor.visitCameraType(this, o, env);
    }

    getId() {
        return this.id;
    }

    getCameraTypeName() {
        return this.cameraTypeName;
    }

    getImageUrl() {
        return this.imageUrl;
    }

    setId(id) {
        this.id = id;
        return this;
    }

    setCameraTypeName(cameraTypeName) {
        this.cameraTypeName = cameraTypeName;
        return this;
    }

    setImageUrl(imageUrl) {
        this.imageUrl = imageUrl;
        return this;
    }

}
