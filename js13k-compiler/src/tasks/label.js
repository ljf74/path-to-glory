'use strict';

const Task = require('./task');

class Label extends Task{
    constructor(label){
        super();
        this.label = label;
    }

    execute(input){
        this.log(this.label);
        return Promise.resolve(input);
    }
}

module.exports = Label;
