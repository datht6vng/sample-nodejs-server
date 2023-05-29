const { newUserService } = require("../../../service/user_service");
const { newUser } = require("../../../entity/user");
const { newId } = require("../../../entity/id");
const { Handler } = require("./handler");

class UserHandler extends Handler {
    constructor(service=newUserService()) {
        super();
        this.service = service;
    }

    getAllUsers(call, callback) {
        this.service.getAllUsers()
        .then(users => {
               
            users = users.map(user => {
                return this.toProtobufConverter.visit(user);
            })

            this.success({ 
                users: users 
            }, callback);
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
    
    createUser(call, callback) {
        let user = this.fromProtobufConverter.visit(newUser(), call.request.user_detail);
        this.service.createUser(user)
        .then(user => {
            user = this.toProtobufConverter.visit(user);
            this.success({
                user_detail: user
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getUserById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.findUserById(id)
        .then(user => {
            
            user = this.toProtobufConverter.visit(user);
            this.success({
                user_detail: user
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    getUserByName(call, callback) {
        this.service.findUserByName(call.request.username)
        .then(user => {
            
            user = this.toProtobufConverter.visit(user);
            this.success({
                user_detail: user
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        }) 
    
    }

    updateUserById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        let user = this.fromProtobufConverter.visit(newUser(), call.request.user_detail);
        this.service.updateUserById(id, user)
        .then(user => {
            
            user = this.toProtobufConverter.visit(user);
            this.success({
                user_detail: user
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }


    deleteUserById(call, callback) {
        let id = this.fromProtobufConverter.visit(newId(), call.request._id);
        this.service.deleteUserById(id)
        .then(user => {
            
            user = this.toProtobufConverter.visit(user);
            this.success({
                user_detail: user
            }, callback)
        })
        .catch(err => {
            this.failure(err, callback);
        })
    }
}


function newUserHandler() {
    return new UserHandler();
}

module.exports.newUserHandler = newUserHandler;
