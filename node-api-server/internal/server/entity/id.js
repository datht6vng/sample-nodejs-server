
class Id {
    value = undefined;
    constructor(value=undefined) {
        this.value = value;
    }


    accept(visitor, o, env) {
        return visitor.visitId(this, o, env);
    }
    
    getValue() {
        return this.value;
    }
    
    setValue(value) {
        this.value = value;
    }
}



function newId(value=undefined) {
    return new Id(value);
}

module.exports.Id = Id;
module.exports.newId = newId;
