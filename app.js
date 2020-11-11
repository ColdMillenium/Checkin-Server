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
function findTodo(id){
    return new Promise((resolve, reject) =>{
        Todo.findOne({_id: id}, (err, result) =>{
            if(err){
                console.log("error in findTodo")
                reject(err);
            }else{
                console.log("returning from findTodo()");
                resolve(result);
            }
        });
    }); 
}

function updateTodo(id, fields){
    return new Promise((resolve, reject) =>{
        Todo.updateOne({_id: id}, fields, (err, result) =>{
            if(err){
                console.log("error in updateTodo()");
                reject(err);
            }else{
                resolve(result);
            }
        });
    }); 
}
app.post('/updateTodo', authenticateToken, (req,res)=>{
    const username = req.user.user;
    console.log(username);
    console.log("updateTodo Request body:");
    console.log(req.body);

    //Check for required data in body
    if(!req.body){
        res.sendStatus(400);
        return;
    }
    if(! '_id' in req.body){
        res.json({
            status: "fail",
            error: {name: "_ID "}
        })
        return;
    }
    const id = req.body._id;
    //create todo properties
    const fields = {}
    if('name' in req.body && req.body.name!=null){
        fields.name = req.body.name;
    }
    if('completed' in req.body && req.body.completed!=null){
        fields.completed = req.body.completed;
    }

    findTodo(id)
    .then((result)=>{
        console.log(result);
        if(result){
            if(result.createdBy != username){
                throw {username: "TODO DOESN'T BELONG TO " + username}
            }else{
                console.log("attempting to update");
                return(updateTodo(id, fields));
            }
        }else{
            throw { _id: "THIS TODO ID DOESN'T EXIST!"}
        }
    })
    .then((result)=>{
        const nModified = result.nModified
        console.log("documents modified: 1");
        if(nModified === 1){
            res.json({
                status: "success",
                data: {
                    nModified: nModified
                }
            })
        }else{
            throw {nModified: nModified}
        }
    })
    .catch((error)=>{
        console.log("ERROR:" + error);
        res.json({
            status: "fail",
            error
        })
    })
})

function deleteTodo(id){
    return new Promise((resolve, reject) =>{
        Todo.updateOne({_id: id}, (err, result) =>{
            if(err){
                console.log("error in deleteTodo()");
                reject(err);
            }else{
                resolve(result);
            }
        });
    }); 
}
app.post('/deleteTodo', authenticateToken, (req, res)=>{
    const username = req.user.user;
    console.log(username);
    console.log("updateTodo Request body:");
    console.log(req.body);

    //Check for required data in body
    if(!req.body){
        res.sendStatus(400);
        return;
    }
    if(req.body._id === null){
        res.json({
            status: "fail",
            error: {name: "_ID "}
        })
        return;
    }
    const id = req.body._id;
    findTodo(id).then((result)=>{
        if(result){
            if(result.createBy === username){
                return deleteTodo(id);
            }else{
                throw {username:"TODO DOESN'T BELONG TO " + username}
            }
           
        }else{
            throw {_id: "THIS TODO ID DOESN'T EXIST!"}
        }
    })
    .then((result)=>{
        console.log(result);
        res.json({
            status: "success",
            data: {}
        })
    })
    .catch((error)=>{
        console.log("ERROR:" + error);
        res.json({
            status: "fail",
            error
        })
    })


});




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





