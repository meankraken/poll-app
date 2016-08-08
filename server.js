'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var app = express();
var Poll = require('./models/polls');

var port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost/MyDataBase');

//set the view engine
app.set('views', process.cwd() + '/views');
app.set('view engine', 'jade');

app.use('/public',express.static(process.cwd() + '/public'));
app.use(flash());
app.use(session({
    secret: 'topsecret',
    resave:'false',
    saveUninitialized: 'false'
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: 'false' }));
app.use(passport.initialize());
app.use(passport.session());

//passport set up 
var Account = require('./models/account'); //Account is the user model
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


app.get('/', function(req,res) {
    res.render('index');
});

app.post('/', function(req,res) {
   if (req.user) {
       res.end(req.user.username);
   } 
   else {
       res.redirect('/login');
   }
});

app.get('/register', function(req,res) {
   res.render('register'); 
});

app.post('/register', function(req,res) {
    var name;
    Account.findOne({ 'username' : req.body.username }, 'username', function(err, account) {
        if (err) {
            console.log(err);
            res.render('register');
        }
        else {
            if (account) {
                res.render('register', { taken: true});
            }
            else {
                Account.register(new Account({ username: req.body.username }), req.body.password, function(err, account) {
                    if (err) {
                        console.log(err);
                        res.render('register');
                    } 
                    else {
                        passport.authenticate('local')(req,res, function() {
                            console.log("Register successful");
                            res.redirect('/');
                        })
                        
                    }
               });
            }
        }
    });
    
    
   
});

app.get('/login', function(req,res) {
    if (req.query.failed) {
        res.render('login', { failed: true });
    }
    else {
   res.render('login');
    }
});


app.post('/login', passport.authenticate('local', { 
    successRedirect: '/', 
    failureRedirect: '/login?failed=true'
})); 



app.listen(port, function () {
      console.log('Node.js listening on port ' + port);
   });
