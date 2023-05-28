

const UserModel = require("../model/user_model");
const { newUser } = require("../entity/user");
const { newFromDatabaseConverter } = require("../data_converter/from_database_converter");
const { newToDatabaseConverter } = require("../data_converter/to_database_converter");

const { newInternalServerError } = require("../entity/error/internal_server_error");


class UserRepository {
    constructor() {
        this.fromDatabaseConverter = newFromDatabaseConverter();
        this.toDatabaseConverter = newToDatabaseConverter();
    }



    async getAll() {
        let userDocs;
        try {
            userDocs = await UserModel.find({});
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return userDocs.map(userDoc => {
            return this.fromDatabaseConverter.visit(newUser(), userDoc);
        })
    }
    
    async create(userEntity) {
        const userDoc = this.toDatabaseConverter.visit(userEntity);
        let newUserDoc;
        try {
            newUserDoc = await UserModel.create(userDoc);
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newUser(), newUserDoc);
    }
    
    async findById(userId) {
        let userDoc;
        userId = userId.getValue();
        try {
            userDoc = await UserModel.findById(userId).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newUser(), userDoc);
    }

    async findByName(username) {
        let userDoc;
        try {
            userDoc = await UserModel.findOne({ username: username }).exec();
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        
        return this.fromDatabaseConverter.visit(newUser(), userDoc);
    }
    
    async findByIdAndUpdate(userId, userEntity) {
        const userDoc = this.toDatabaseConverter.visit(userEntity);
        const filter = {
            _id: userId.getValue()
        }
        let newUserDoc;
        try {
            newUserDoc = await UserModel.findOneAndUpdate(filter, userDoc, { new: true }); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newUser(), newUserDoc);
    }

    async findByIdAndDelete(userId) {
        const filter = {
            _id: userId.getValue()
        }
        let deleteUserDoc;
        try {
            deleteUserDoc = await UserModel.findOneAndDelete(filter); // set new to true to return new document after update
        }
        catch(err) {
            throw newInternalServerError("Database error", err);
        }
        return this.fromDatabaseConverter.visit(newUser(), deleteUserDoc);
    }
}



function newUserRepository() {
    return new UserRepository();
}

module.exports.newUserRepository = newUserRepository;
