
class Id {
    value = null;
    constructor(value=null) {
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

function newId(value=null) {
    return new Id(value);
}

module.exports.Id = Id;
module.exports.newId = newId;
