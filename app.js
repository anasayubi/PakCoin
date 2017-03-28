var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var session = require('express-session')  
// Import User model
var User = require("./models/user")

// Initialise application
var port = 3000
var app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
// Initialise sessions
app.use(session({
    secret: "TKRv0IJs=HYqrvagQ#&!F!%V]Ww/4KiVs$s,<<MX",
    resave: true,
    saveUninitialized: true
}))

// Parse body before any post requests
app.use(bodyParser.urlencoded({
  extended: true
}))

// Initialise static routes
var staticPath = path.join(__dirname, "static")
app.use(express.static(staticPath))

// Initialise routing
app.get('/', function(req, res, next){
    // If user in session then show profile
    if(req.session.user)
        res.render('profile', {user: req.session.user})
    // Otherwise show index page
    else
        res.render('index')
})
// Note: Must be removed in production. Signup will occur from index page 
app.get('/signup',function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    else
        res.render('signup')
})
// Note: Must be removed in production. Login will occur from index page
app.get('/login',function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    else
        res.render('login', {err: null})
})
//
app.get('/logout', function(req, res, next){
    // If user in session
    if(req.session.user){
        //res.session.user = undefined
        req.session.destroy(function(err){
            res.redirect('/')
        }) 
    }
    // If user isn't in session
    else{
        var err = new Error(`Can't log out because no user logged in`)
        //console.error(err.message) 
        next(err)
    }
})
// GOTO: More validation procedures must still be added
// Signup form submission procedure
app.post('/signup', function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    // Otherwise if a user is not in session
    else{
        // Create a new user based on submitted form details
        var newUser = User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            username: req.body.username.toLowerCase(),
            email: req.body.email.toLowerCase(),
            password: req.body.password,
            // GOTO: use some encoder for this
            currPublicKey: '12345'
        })
        // Save the new input user. If err occurs then pass to error handling middleware
        newUser.save(function(err, user, numAffected){
            if(err) // GOTO: must return error (not to signup.ejs but to index through AJAX)
                next(err)
            else{
                // GOTO: must go to profile page 
                req.session.user = req.body
                res.redirect('/')
            }
        })
    } 
})
// Login form submission procedure
app.post('/login', function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    // Otherwise if a user is not in session
    else{
        // Find user by username
        User.findOne({username: req.body.identifier}, function(err, userByUsername){
            // If the username can't be found then 'userByUsername' will be null
            // Then the if statement below will run
            if(!userByUsername){
                // Find user by email
                User.findOne({email: req.body.identifier}, function(err, userByEmail){ 
                    // If the username is found by email then 'userByEmail' will be true
                    // Then the if statement below will run
                    if(userByEmail){
                        userByEmail.checkPassword(req.body.password, 
                            // Function defines password validation logic
                            function(err, isMatch){
                                // If the password matches then set session data
                                // and redirect to '/'
                                if(isMatch){
                                    req.session.user = userByEmail
                                    //console.log(req.session.user)
                                    res.redirect('/')
                                } 
                                // If the password doesn't match then return back to 
                                // login with error
                                // GOTO: in production this must loop back to '/' without any session initialisation
                                else{
                                    res.render('login', {err: 'Username or password incorrect'})
                                }
                            }
                        )
                    }
                    // If identifier can't be found by username or by email
                    // return an error message
                    else // GOTO: add some error message back (not to login.ejs but to index through AJAX)
                         // GOTO: in production this must loop back to '/' without any session initialisation
                        res.render('login', {err: 'Username or password incorrect'})
                })
            }
            // If user is found by username
            else{
                userByUsername.checkPassword(req.body.password, 
                    // Function defines password validation logic
                    function(err, isMatch){
                        // If the password matches then set session data
                        // and redirect to '/'
                        if(isMatch){
                            req.session.user = userByUsername
                            //console.log(req.session.user)
                            res.redirect('/')
                        } 
                        // If the password doesn't match then return back to 
                        // login with error
                        // GOTO: in production this must loop back to '/' without any session initialisation
                        else{
                            res.render('login', {err: 'Username or password incorrect'})
                        }
                    }
                )
            }
        })
    }
})
// Since request does not match any path then pass to error handling middleware
app.use(function(req, res, next){
    var err = new Error(`${req.path} does not match any path in application`)
    //console.error(err.message) 
    next(err)
})

// Error handling middleware
app.use(function(err, req, res, next){
    res.render('error')
    console.log('\x1b[31m', 'App: ')
    console.log('\x1b[31m', err)
})

// Send 'app' to start listening if mongodb initialises
// Send 'port' for display purposes   
require('./db')(app, port)