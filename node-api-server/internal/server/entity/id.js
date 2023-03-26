
class Id {
    value = undefined;
    constructor(value=undefined) {
        this.value = value;
    }
}

Id.prototype.accept = function(visitor, o, env) {
    return visitor.visitId(this, o, env);
}

Id.prototype.getValue = function() {
    return this.value;
}

Id.prototype.setValue = function(value) {
    this.value = value;
}

function newId(value=undefined) {
    return new Id(value);
}

module.exports.Id = Id;
module.exports.newId = newId;
