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

var port = process.env.PORT || 8080;
var url = process.env.MONGOLAB_URI || 'mongodb://localhost/MyDataBase';

mongoose.connect(url);


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


var Poll = require('./models/poll');

app.get('/', function(req,res) { //home page, poll list view
    if (req.user) {
        res.render('index', { user: req.user.username });
    }
    else {
        res.render('index', { user: "" });
    }
});

app.post('/', function(req,res) { //create poll
   if (req.user) {
       Poll.count({ creator: req.user.username }, function(err, count) {
           console.log(count);
           if (count>=10) {
                res.render('index', { user: req.user.username, limitReached: true });    
           
           }
           else {
               var optionsArr = [];
               var arr = req.body.options.split(/[\n\r]+/g);
               for (var i=arr.length-1; i>=0; i--) {
                   if (arr[i].length==0) {
                       arr.pop();
                   }
               }
               arr.map(function(item) {
                   optionsArr.push({ title: item, votes: 0 });
               });
        
               var newPoll = new Poll({ question: req.body.question, options: optionsArr, usersVoted: [], ipsVoted: [], creator: req.user.username });
               newPoll.save(function(err,poll) {
                  if (err) {
                      console.log(err);
                  } 
                  else {
                      res.redirect('/');
                  }
               });
           }
        }) ;
       
   } 
   else {
       res.render('login', { user: "" });
   }
});

app.get('/register', function(req,res) { //regristration page
    if (req.user) {
        res.render('register', { user: req.user.username });
    }
    else {
        res.render('register', { user: "" }); 
    }
});

app.post('/register', function(req,res) { //register account 
    var name;
    Account.findOne({ 'username' : req.body.username }, 'username', function(err, account) {
        if (err) {
            console.log(err);
            res.render('register', { user: "" });
        }
        else {
            if (account) {
                res.render('register', { user: "", taken: true});
            }
            else {
                Account.register(new Account({ username: req.body.username }), req.body.password, function(err, account) {
                    if (err) {
                        console.log(err);
                        res.render('register', { user: "" });
                    } 
                    else {
                        passport.authenticate('local')(req,res, function() {
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
        res.render('login', { user: "", failed: true });
    }
    else if (req.user) {
        res.render('login', {user: req.user.username});
    }
    else {
        res.render('login', { user: "" });
    }
});


app.post('/login', passport.authenticate('local', { 
    successRedirect: '/', 
    failureRedirect: '/login?failed=true'
})); 

app.get('/logout', function(req,res) {
   req.logout(); 
   res.redirect('/');
});

app.get('/profile', function(req,res) { //user profile
   if (req.user) {
        Poll.find({ creator: req.user.username }).sort({ _id: -1 }).exec(function(err, polls) {
           if (err) {
               console.log(err);
           } 
           else {
               res.render("profile", {user: req.user.username, polls: polls });
           }
           
        });
   } 
   else {
       res.render("login");
   }
});


app.get('/getPolls', function(req,res) { //set up API to grab polls
    var polls = Poll.find({}).limit(20).sort({_id:-1});
    polls.exec(function(err, poll) {
        if (err) {
            console.log(err);
        }
        else {
            res.end(JSON.stringify(poll));
        }
    })
    
});

app.get('/poll/:id', function(req,res) { //show poll chart
    Poll.findOne({ _id: req.params.id }, function(err, poll) {
        if (req.user) {
            res.render('viewPoll', { user: req.user.username, poll: poll });
        }
        else {
            res.render('viewPoll', { user:"", poll: poll });
        }
    }) ;
});

app.post('/poll/:id', function(req,res) { //handle votes on poll with id
    var ip = req.headers['x-forwarded-for'] || 
     req.connection.remoteAddress || 
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
     
    var voted = false;
    
    Poll.findOne({_id: req.params.id }, function(err,poll) {
        if (err) {
            console.log(err);
        }
        if (req.user) {
            poll.usersVoted.forEach(function(item) {
               if (item==req.user.username) {
                   voted = true;
                   console.log("User already voted");
               } 
            });
        }
        if (!req.user) {
            poll.ipsVoted.forEach(function(item) {
               if (item==ip) {
                   voted = true;
                   console.log("IP already voted");
               }
            });
        }
        
            if (!voted) {
                poll.ipsVoted.push(ip);
                if (req.user) {
                    poll.usersVoted.push(req.user.username);
                }
                poll.options = poll.options.map(function(item) {
                   if (item.title==req.body.options) {
                       console.log("Incremented votes");
                       return { title: item.title, votes: item.votes+1 };
                   } 
                   else {
                       return item;
                   }
                });
                poll.save();
                
                if (req.user) {
					res.render('viewPoll', {user:req.user.username, poll: poll, alreadyVoted: false});
				}
				else {
					res.render('viewPoll', {user:"", poll: poll, alreadyVoted: false});
				}
        
            }
            else {
				if (req.user) {
					res.render('viewPoll', { user:req.user.username, poll: poll, alreadyVoted: true });
				}
				else {
					res.render('viewPoll', { user:"", poll: poll, alreadyVoted: true });
				}
            }
    });
    
    
    
    
});

app.post('/deletePoll/:id', function(req,res) { //delete poll from db
    var id = req.params.id;
    if (req.user) {
        Poll.findOne({ _id: id }, function(err,poll) {
           if (poll.creator == req.user.username) {
               poll.remove();
           }
           
        });
    }
    else {
        res.redirect('/');
    }
});

app.post('/addOption/:id/:option', function(req,res) { //add option to poll with id
    var id = req.params.id;
    if (req.user) {
        Poll.findOne({_id: id}, function(err,poll) {
           if (poll.creator == req.user.username) {
               console.log("adding option");
               var newOption = req.params.option;
               poll.options.push({ title: newOption, votes: 0 });
               poll.save();
           } 
        });
        res.redirect('/poll/' + id);
    }
    else {
        res.redirect('/');
    }
});



app.listen(port, function () {
      console.log('Node.js listening on port ' + port);
   });
