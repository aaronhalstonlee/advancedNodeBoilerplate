const passport = require('passport');
const bcrypt = require('bcryptjs');

module.exports = function (app, myDataBase) {

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
        let pathToGo = `/profile` || '';
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
        const hash = bcrypt.hashSync(req.body.password, 12);
        myDataBase.findOne({username: req.body.username}, (err, user) => {
            if(err){ 
                console.log(err);
                next(err) 
            } else if(user){
                console.log('user already exists!')
                res.redirect('/');
            } else {
                myDataBase.insertOne({username: req.body.username, password: hash }, (err, doc) => {
                    if(err) {
                        console.log('could not insert user to database')
                        console.log(err);
                        res.redirect('/')
                    } else {
                        console.log(doc.ops[0])
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
}

const ensureAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/');
}