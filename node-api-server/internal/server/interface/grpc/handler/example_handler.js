
class ExampleHandler {
    constructor() {

    }
    retrievePasswords(passwordMessage, callback) {
        let dummyRecords = {
            "passwords": [
                { id: "153642", password: "default1", hashValue: "default", saltValue: "default" },
                { id: "234654", password: "default2", hashValue: "default", saltValue: "undefined" },
                { id: "234655", password: "default2", test_message: { test: "abcd" } },
                { id: "234655", password: "default2", residual: "text" }
            ]
        };
        console.log(9999999999999999999999)
        callback(null, dummyRecords);
    }


    addNewDetails(passwordMessage, callback) {

        console.log(passwordMessage.request)
        callback(null, passwordMessage.request);
    }
}

module.exports.ExampleHandler = ExampleHandler;
