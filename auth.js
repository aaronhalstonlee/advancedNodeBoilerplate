const passport = require('passport');
const LocalStrategy = require('passport-local');
const ObjectID = require('mongodb').ObjectID
const bcrypt = require('bcryptjs');

module.exports = function (app, myDataBase) {
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
                console.log('User '+ username +' attempted to log in!');
                if(err){ console.log(err); return done(err); }
                if(!user){ console.log('no user by that name'); return done(null, false); }
                if(!bcrypt.compareSync(password, user.password)){ return done(null, false); }
                return done(null, user);
            });
        } catch(err){
            console.log("could not findOne(), error: " + err)
        }
    }));
}