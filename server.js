//'use strict';
require('dotenv').config({path: "./sample.env"});
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const ObjectID = require('mongodb').ObjectID


const app = express();
app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());
console.log("session secret: ", process.env.SESSION_SECRET)//app.config.session.store = new CustomStore(_.clone(app.config.session));
app.use(session({
  secret: '444',//process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));


myDB(async client => {
  const myDataBase = await client.db('database').collection('users')
  
  app.route('/').get((req, res) => {
    res.render(process.cwd() + '/views/pug', {
      title: 'Connected to database', 
      message: 'Please login'
    });
  });
  
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    
    myDataBase.findOne({_id: new ObjectId(id) }, (err, doc) => {
      done(null, doc);
    })
  })

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: e,
      message: "unable to log in"
    });
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});