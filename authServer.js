require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

//makes it so our application can handle json's being sent from the client
app.use(express.json());
app.use(cors());

let refreshTokens = [];

//gettin password from .env file
const DB_USER = process.env.DB_USER;
const DB_PW = process.env.DB_PW;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
console.log("user is " + DB_USER);

//connect to mongodb
const dbURI = `mongodb+srv://${DB_USER}:${DB_PW}@portfolio-cluster.21i0t.mongodb.net/checkin-db?retryWrites=true&w=majority`
console.log("attempting to connect to database...");
mongoose.connect(dbURI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then((result) => {
        console.log('SUCCESS: connected to db');
        app.listen(4000);
    })
    .catch((err) => console.log(err));

app.get('/', (req,res) =>{
    console.log('woah');
})
app.post('/token', (req, res) =>{
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) =>{
        if(err) return res.sendStatus(403)

        //can't pass stnadard user object because it contains other information like the issue date of token
        const accessToken = generateAccessToken({name: user.name});
        res.json({accessToken: accessToken});
    })
})

app.delete('/logout', (req, res) =>{
    //removing refresh token from refresh token db 
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204);
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
function getUserCred(username){
    console.log("searching for user credentials...");
    return new Promise((resolve, reject) =>{
        User.findOne({username: username}, (err, result) =>{
            if(err){
                console.log(err)
                reject(err);
            }else{
                resolve(result);
            }
        });
    }); 
}



//it's a post here because we actually want to CREATE a token.
app.post('/login', (req, res) =>{
    if(!req.body){
        console.log('ABORT: no body')
        res.sendStatus(400);
        return;
    }
    console.log(req.body);
    if( ! 'username' in req.body){
        console.log('ABORT: no username')
        res.sendStatus(400);
        return;
    }
    if( ! 'password' in req.body){
        console.log('ABORT: no password')
        res.sendStatus(400);
        return;
    }
   
    const username = req.body.username;
    const password = req.body.password;

    //Authenticate the user so we can give them access
    getUserCred(username)
    .then((user_found)=>{
        if(!user_found){
            throw {password:"USER NOT FOUND"}
        }
        if(user_found.password !== password){
            throw {password:"PASSWORD INCORRECT"}
        }

        console.log(username+ " is authenticated");
        //Now that user is valid, create JWT below
        const accessToken = generateAccessToken({user: username});
        const refreshToken = jwt.sign(username, REFRESH_TOKEN_SECRET);
        refreshTokens.push(refreshToken);

        //send accesstoke and refresh token back to the user
        res.json({
            username:username, 
            accessToken: accessToken, 
            refreshToken: refreshToken
        });
    }).catch((error) =>{
        console.log(error);
        res.json({
            status: "fail",
            error
        })
    })
})
function generateAccessToken(user){
    return jwt.sign(user, ACCESS_TOKEN_SECRET, {expiresIn: '3600s'})
}

app.post('/register', (req, res) =>{
    // res.header("Access-Control-Allow-Origin", "*");
    // res.header("Access-Control-Allow-Headers");
    console.log("someone pinged  register");
    
    if(!req.body){
        console.log('ABORT: no body')
        res.sendStatus(400);
        return;
    }
    console.log(req.body);
    if( ! 'username' in req.body){
        console.log('ABORT: no username')
        res.sendStatus(400);
        return;
    }
    if( ! 'email' in req.body){
        console.log('ABORT: no email')
        res.sendStatus(400);
        return;
    }
    if( ! 'password' in req.body){
        console.log('ABORT: no password')
        res.sendStatus(400);
        return;
    }
  
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    //VERIFY UNIQUE EMAIL AND USERNAME
    checkUserExists(username)
    .then((userFound) =>{
        if(userFound){
            throw {username: "USERNAME ALREADY EXISTS"}
        }
        
    })
    .then((result)=>{return checkEmailExists(req.body.email)})
    .then((emailFound) => {
        console.log(emailFound + "!!!");
        if(emailFound){
            throw {email: "EMAIL ALREADY EXISTS"}
        }
       
    })
    .then((result)=>{
        //AIGHT, SO EMAIL AND NAME ARE LEGIT. LET'S TRY ADDING
        const user = new User({
            username: username,
            email: email,
            password: password
        });
    
        user.save()
            .then((r) =>{
                console.log('username: ' + username + " was succesffully created")
                console.log(r);
                res.json({       
                        status: "success",
                        data: { username: username, password:password}
                });
            })
            .catch((err) => {
                console.log(err)
                reject(err)
            })
    })
    .catch((error)=>{
        
        console.log(error);
        res.json({ 
            status: "fail",
            error
        });
    })
})
