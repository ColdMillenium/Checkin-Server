const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
}, {timestamps: true}); //automatically sets timestamp documents on our user as well. created at, updated at,etc

//its going to pluralize what you call the model and look for that collection Name is important
const User = mongoose.model('User', userSchema);
module.exports = User;

// user:{
//     id: uuid,
//     userName:
//     email:
//     password:
//     friends: //array of user types
//     groups: //array of group types
//     todo-list [], //array of todo type
//     project-list[], //array of project type
//     profile-pic: 


// }