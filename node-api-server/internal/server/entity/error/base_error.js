
class BaseError extends Error {
    constructor(name, description, isOperational) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.description = description;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}

BaseError.prototype.getName = function() {
    return this.name;
}

BaseError.prototype.getDescription = function() {
    return this.description;
}

BaseError.prototype.isOperational = function() {
    return this.isOperational;
}

module.exports.BaseError = BaseError;
