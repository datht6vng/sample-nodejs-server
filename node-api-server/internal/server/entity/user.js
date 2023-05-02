
class User {
    id = undefined;
    username = undefined;
    password = undefined;
    role = undefined;

    accept(visitor, o, env) {
        return visitor.visitIotDevice(this, o, env);
    }

    getId() {
        return this.id;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getRole() {
        return this.role;
    }

    setId(id) {
        this.id = id;
        return this;
    }
    
    setUsername(username) {
        this.username = username;
        return this;
    }
    
    setPassword(password) {
        this.password = password;
        return this;
    }
    
    setRole(role) {
        this.role = role;
        return this;
    }
}

function newUser() {
    return new User();
}

module.exports.newUser = newUser;
