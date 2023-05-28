const jwt = require("jsonwebtoken");
const { Controller } = require("./controller");
const { newUserHandler } = require("../../../service/grpc_client/handler/user_handler");
const { config } = require("../../../../../pkg/config/config");

const JWT_SECRET_KEY = config.jwt.SECRET_KEY;

class UserController extends Controller {
    constructor(userHandler=newUserHandler()) {
        super();
        this.handler = userHandler;
        
        this.getAllUsers = this.getAllUsers.bind(this);
        this.createUser = this.createUser.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.updateUserById = this.updateUserById.bind(this);
        this.deleteUserById = this.deleteUserById.bind(this);

        this.login = this.login.bind(this);
        this.verifyToken = this.verifyToken.bind(this);
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

    async login(req, res, next) {
        const body = req.body;
        if (!body.username || !body.password) {
            this.failure(res)(400, "Username and password is required");
        }
        else {
            const arg = {
                username: body.username
            }
            try {
                const response = await this.handler.getUserByName(arg);
                if (!response || !response.data || !response.data.user_detail || !response.data.user_detail._id) {
                    throw new Error("Invalid Credentials");
                }
                const userDetail = response.data.user_detail;
                const username = userDetail.username;
                const role = userDetail.role;
                if (body.password == response.data.user_detail.password) {
                    const token = jwt.sign(
                        { _id: userDetail._id, username, role },
                        JWT_SECRET_KEY
                    )
                    userDetail.token = token;
                }
                this.success(res)(200, "Success", response.data);
            }
            catch(err) {
                this.failure(res)(400, err.toString());
            }
        }

    }


    verifyToken(req, res, next) {
        const token = req.body.token || req.query.token || req.headers["x-access-token"];
        
        if (!token) {
            this.failure(res)(403, "A token is required for authentication");
        }
        try {
            const decoded = jwt.verify(token, JWT_SECRET_KEY);
            this.success(res)(200, "Success", decoded);
        } catch (err) {
            this.failure(res)(401, "Invalid token");
        }
    }
    
}




function newUserController() {
    return new UserController();
}

module.exports.newUserController = newUserController;
