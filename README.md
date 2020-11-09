# Checkin-Server
This repo will contain the necessary api servers for the checkin web app. This app is using a Node.js & MongoDB backend.
![Node and Mongo](https://www.nodejsera.com/library/assets/img/node-mongo.png)



## How this project is broken down
So basically there are two Servers. There's an authServer.js and app.js . (I'm thinking i might change app.js to appServer.js but w/e. That's what it is right now).

#### 1) AuthSever (authServer.js)
* handles SignIn and validates that user exists in mongoDB
* handles SignUp and creates new users in mongoDB assuming unique username and password.
* handles the creation JWT.

#### 2) AppServer (app.js)
* handles all api calls where user has to already be authenticated
* checks that user has correct access token before executing main api functionality.


## Setup
Before using this repo you will need to made a .env file in the root folder.
Inside it you will need to add these fields
```
ACCESS_TOKEN_SECRET=<access_token>
REFRESH_TOKEN_SECRET=<refresh_token>
DB_USER=<database_username>
DB_PW=<database_password>
```
### Access token & Refresh token fields:
You will need both a access token and a refresh token to authenticate your users using JWT. If you don't know about JWT or need a refresher see the resource links down below.  
#### How to generate your tokens:
Run this code in your favorite command line terminal.
> node

> require('crypto').randomBytes(64).toString('hex')

this will generate huge string that you can put in your access token. Generate another one and put it into your refresh token.

### Database Username and Password fields:
You will need to login to your mongodDB atlas account and the get the username and password of the database cluster you want to access.
See *Node.js Crash Course Tutorial #9-MongoDB* resource below


## How to start the servers
In order to start these severs, you're going to have to run two commands
> npm run devStart

> npm run devStart

## Helpful Resources I used
* [What Is JWT and Why Should You Use JWT](https://www.youtube.com/watch?v=7Q17ubqLfaM)
* [JWT Authentication Tutorial - Node.js](https://www.youtube.com/watch?v=mbsmsi7l3r4)
* [Node.js Crash Course Tutorial #9-MongoDB](https://www.youtube.com/watch?v=bxsemcrY4gQ)
   * I used this video specifically but im pretty sure this whole series is useful
