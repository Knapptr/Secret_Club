require('dotenv').config()
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('connect-flash');
const bouncer = require('./bouncer');
//passport config
const passportInit = require('./passportconfig.js');
//init config
passportInit(passport);
//initexpress
app = express();
app.set('view engine','pug')
const router = require('./routes/index');
// db
const mongoose = require('mongoose');

//DATABASE SETUP
mongoose.connect(`mongodb+srv://${process.env.DB_UN}:${process.env.DB_PW}@cluster0-9ydve.gcp.mongodb.net/test?retryWrites=true&w=majority`,{useNewUrlParser:true}).then(()=>console.log('Connected to DB'));
db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
   
//Middleware config
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(bouncer);
app.use(router);


//open server
app.listen(3000, function () {
    console.log('listening on port 3000')
})