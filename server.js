'use strict';
require('dotenv').config({path: "./sample.env"});
const express = require('express');
const myDB = require('./connection');
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const ObjectID = require('mongodb').ObjectID


const app = express();
app.set('view engine', 'pug');

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

myDB(async (client) => {
  const myDataBase = await client.db('database').collection('users');
  
  
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: 'Connected to database', 
      message: 'Please login',
      showLogin: true,
      showRegistration: true
    });
  });

  app.route('/login').post(passport.authenticate('local', { failureRedirect:'/'}),(req,res) => {
      console.log('redirecting to /profile');
      let pathToGo = `http://localhost:${process.env.PORT}/profile` || '';
      res.redirect(pathToGo);
  })

  app.route('/profile').get(ensureAuthenticated, (req, res) => {
    console.log('rendering /profile');
    res.render('pug/profile', {username: req.user.username});
  });

  app.route('/logout').get((req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/register').post((req, res, next) => {
    myDataBase.findOne({username: req.body.username}, (err, user) => {
      if(err){ 
        next(err) 
      } else if(user){
        res.redirect('/');
      } else {
        myDataBase.insertOne({username: req.body.username, password: req.body.password }, (err, doc) => {
          if(err) {
            console.log('could not insert user to database')
            console.log(err);
            res.redirect('/')
          } else {
            next(null, doc.ops[0]);
          }
        });
      }
    });
  },
  passport.authenticate('local', {failureRedirect: '/' }), (req, res, next) => {
    res.redirect('/profile');
  });

  app.use((req, res, next) => {
      res.status(404).type('text').send('Not found');
  })

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({_id: new ObjectID(id) }, (err, doc) => {
      done(null, doc);
    })
  })
  
  passport.use(new LocalStrategy( (username, password, done) => {
    try {
      myDataBase.findOne({username: username}, (err, user) => {
        console.log('User '+ username +' attempted to log in and user is: ');
        if(err){ console.log(err); return done(err); }
        if(!user){ console.log('no user by that name'); return done(null, false); }
        if(password !== user.password){ console.log('password incorrect'); return done(null, false); }
        return done(null, user);
      });
    } catch(err){
      console.log("could not findOne(), error: " + err)
    }
  }));

}).catch(e => {
  app.route('/').get((req, res) => {
    res.render('pug', {
      title: e,
      message: "unable to log in"
    });
  });
});

const ensureAuthenticated = (req, res, next) => {
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});