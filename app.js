const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Todo = require('./models/Todo')
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

//makes it so our application can handle json's being sent from the client
app.use(express.json());
app.use(cors());

//gettin password from .env file
const DB_USER = process.env.DB_USER;
const DB_PW = process.env.DB_PW;
const ACCESS_TOKEN_SECRET= process.env.ACCESS_TOKEN_SECRET;
console.log("user is " + DB_USER);

//connect to mongodb
const dbURI = `mongodb+srv://${DB_USER}:${DB_PW}@portfolio-cluster.21i0t.mongodb.net/checkin-db?retryWrites=true&w=majority`
console.log("attempting to connect to database...");
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => {
        console.log('SUCCESS: connected to db');
        app.listen(8000);
    })
    .catch((err) => console.log(err));

// mongoose and mongo sandbox routes
function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization']

    //if authHeader doesnt exist then token will be undefined, otherwise it will be the token
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401);

    jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
        console.log(req.body);
        if(err) return res.sendStatus(403);
        req.user = user
        next(); //I think this function is the original api call
    });
}
//authenticateToken is acting as our middleware. Middleware meaning
app.get('/posts', authenticateToken,(req, res) =>{
    
    res.json(posts.filter(post => post.username === req.user.name));
})

app.get('/myTodos', authenticateToken,(req, res) =>{
    const username = req.user.user;
    console.log(username);
    Todo.where('createdBy').equals(username).exec((err, result)=>{
        if(err){
            console.log(err);
            res.sendStatus(500);
        }else{
            res.json({
                status: "success",
                data: result
            })
        }
    })
})

app.post('/createTodo', authenticateToken, (req,res) =>{
    const username = req.user.user;
    console.log(username);
    console.log(req.body);

    //Check for required data in body
    if(!req.body){
        res.sendStatus(400);
        return;
    }
    if(! 'name' in req.body){
        res.json({
            status: "fail",
            error: {name: "NAME CANNOT BE NULL"}
        })
        return;
    }
    if(! 'completed' in req.body){
        res.json({
            status: "fail",
            error: {name: "COMPLETED CANNOT BE NULL"}
        })
        return;
    }
    //create todo properties
    const properties = {
        name: req.body.name, 
        createdBy: username, 
        completed: req.body.completed
    };
    console.log(properties)

    //construct Todo object and save to database
    const todo = new Todo(properties);
    todo.save()
        .then((result)=>{
            console.log(result);
            res.json({
                status:"success",
                data: result
            })
        })
        .catch((err)=>{
            console.log(err);
            res.sendStatus(500);
        })
    

})






app.get('/all-users', (req, res) =>{
    User.find()
        .then((result) => {
            res.json(result);
        })
        .catch((err) => {
            console.log(err);
        })
})

function checkUserExists(username){
    return new Promise((resolve, reject) =>{
        User.findOne({username: username}, (err, result) =>{
            if(err){
                reject(err);
            }else{
                if(result){
                    resolve(true);
                }else{
                    resolve(false);
                }
            }
        });
    }); 
}
function checkEmailExists(email){
    console.log("looking for " + email);
    return new Promise((resolve, reject) =>{
        User.findOne({email: email}, (err, result) =>{
            if(err){
                reject(err);
            }else{
                if(result){
                    resolve(true);
                }else{
                    resolve(false);
                }
            }
        });
    }); 
}
app.get('/userExists', (req, res) =>{
        if(!req.body || !req.body.username){
            res.sendStatus(400);
            return;
        }
        checkUserExists(req.body.username)
        .then((userFound)=>{
            res.json({userFound: userFound})
        }).catch((err) =>{
            res.send(err);
        })
        
})
app.get('/emailExists', (req, res) =>{
    if(!req.body || !req.body.email){
        res.sendStatus(400);
        return;
    }
    checkEmailExists(req.body.email)
    .then((emailFound)=>{
        console.log('No emails here boys')
        res.json({emailFound: emailFound})
    }).catch((err) =>{
        res.send(err);
    })
    
})





