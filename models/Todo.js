const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    createdBy: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    description:{
        type:String,
    },
    dueDate:{
        type:String,
    },
    completed: {
        type: Boolean,
        required: true
    }
}, {timestamps: true}); //automatically sets timestamp documents on our user as well. created at, updated at,etc

//its going to pluralize what you call the model and look for that collection Name is important
const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;

// todo:{
//     id: uuid string,
//     projects: [] , //aray of project type
//     name: string,
//     desc: string,
//     due-date: //date type? or string
//     subtasks: [], //array of todo type
//     completed: boolean,
// }