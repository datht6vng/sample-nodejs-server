
const { newUserRepository } = require("../repository/user_repository");

class UserService {
    constructor(repository=newUserRepository()) {
        this.repository = repository;
    }

    async getAllUsers() {
        const users = await this.repository.getAll();
        return users;
    }
    
    async createUser(user) {
        const userEntity = await this.repository.create(user);
        return userEntity; 
    }
    
    async findUserById(userId) {
        const userEntity = await this.repository.findById(userId);
        return userEntity;
    }
    
    async updateUserById(userId, userDetail) {
        const userEntity = await this.repository.findByIdAndUpdate(userId, userDetail);
        return userEntity;
    }


    async deleteUserById(userId) {
        const userEntity = await this.repository.findByIdAndDelete(userId);
        return userEntity;
    }
}



function newUserService(repository=newUserRepository()) {
    return new UserService(repository);
}


module.exports.newUserService = newUserService;
