
class ExampleHandler {
    constructor() {

    }
    retrievePasswords(passwordMessage, callback) {
        let dummyRecords = {
            "passwords": [
                { id: "153642", password: "default1", hashValue: "default", saltValue:       "default" },
                { id: "234654", password: "default2", hashValue: "default", saltValue: "default" }]
        };
        console.log(9999999999999999999999)
        callback(null, dummyRecords);
    }
}

module.exports.ExampleHandler = ExampleHandler;
