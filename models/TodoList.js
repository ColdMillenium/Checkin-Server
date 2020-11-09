const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TodoListSchema = new Schema({
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name:{
        type: String,
        required: true
    },
    todos:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo",
    }]
    
}, {timestamps: true}); //automatically sets timestamp documents on our user as well. created at, updated at,etc

//its going to pluralize what you call the model and look for that collection Name is important
const TodoList = mongoose.model('TodoList', TodoListSchema);
module.exports = TodoList;