
class BaseError extends Error {
    constructor(name, description, isOperational) {
        super(description);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
        this.description = description;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }

    getName() {
        return this.name;
    }
    
    getDescription() {
        return this.description;
    }
    
    isOperationalError() {
        return this.isOperational;
    }

    toString() {
        return this.getDescription();
    }
}

function newBaseError(name, description, isOperational) {
    return new BaseError(name, description, isOperational);
}

module.exports.BaseError = BaseError;
module.exports.newBaseError = newBaseError;
