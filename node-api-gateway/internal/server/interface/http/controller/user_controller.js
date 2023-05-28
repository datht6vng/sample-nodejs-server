const { Controller } = require("./controller");
const { newUserHandler } = require("../../../service/grpc_client/handler/user_handler");

class UserController extends Controller {
    constructor(userHandler=newUserHandler()) {
        super();
        this.handler = userHandler;
        
        this.getAllUsers = this.getAllUsers.bind(this);
        this.createUser = this.createUser.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.updateUserById = this.updateUserById.bind(this);
        this.deleteUserById = this.deleteUserById.bind(this);
    }

    getAllUsers(req, res, next) {
        let arg = {};
        this.handler.getAllUsers(arg, this.success(res), this.failure(res));
    }
    
    createUser(req, res, next) {
        let arg = {
            user_detail: req.body
        };
        this.handler.createUser(arg, this.success(res), this.failure(res));
    }

    getUserById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.getUserById(arg, this.success(res), this.failure(res));
    }

    updateUserById(req, res, next) {
        let arg = {
            _id: req.params.id,
            user_detail: req.body
        };
        this.handler.updateUserById(arg, this.success(res), this.failure(res));
    }

    deleteUserById(req, res, next) {
        let arg = {
            _id: req.params.id
        };
        this.handler.deleteUserById(arg, this.success(res), this.failure(res));
    }
}




function newUserController() {
    return new UserController();
}

module.exports.newUserController = newUserController;
