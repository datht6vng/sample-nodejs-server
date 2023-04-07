
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
}



module.exports.BaseError = BaseError;
