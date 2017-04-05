var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var session = require('express-session')
var bitcoinAddress = require('bitcoin-address')
// Import User model
var User = require("./models/user")
// Import Admin model
var Admin = require("./models/admin")
// Import coinbase client
var client = require("./coinbase")
// Import error object to message translator
var translateError = require('./helperFiles/translateError')

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
    if(req.session.user){ 
        // Get exchange rates from coinbase API
        client.getExchangeRates({'currency': 'BTC'}, function(err, rates) {
            // Get account details from coinbase API
            client.getAccount(req.session.user.coinbaseid, function(err, account) {
                // delete client data from the account as the information is redundent
                //  'account.client' contains transmision based info which is not needed
                delete account.client
                // Store exchange rates
                rates = {'BTCtoPKR': rates.data.rates.PKR, 'BTCtoUSD': rates.data.rates.USD} 
                // create var to hold the error while the error message is removed from session var
                // removed so that error is shown only once
                var error = req.session.user.error_message
                // removing error message from session
                req.session.user.error_message = null
                // create var to hold the success while the success message is removed from session var
                // removed so that success is shown only once
                var success = req.session.user.success_message
                // removing success message from session
                req.session.user.success_message = null
                // Render the user profile with all data
                res.render('profile', {user: req.session.user, rates: rates, coinData: account, error: error, success: success})
            })
        })
    }
    // Redirect so that admin can login to admin profile
    else if(req.session.admin){
        res.redirect('admin')
    }
    // Otherwise show index page
    else
        res.render('index')
}) 
app.get('/signup',function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    // Redirect so that admin can login to admin profile
    else if(req.session.admin){
        res.redirect('admin')
    }
    else
        res.render('signup', {err: null})
})
app.get('/login',function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    // Redirect so that admin can login to admin profile if admin is logged in
    else if(req.session.admin){
        res.redirect('admin')
    }
    else
        res.render('login', {err: null})
})
// Allow a user to logout 
app.get('/logout', function(req, res, next){
    // If user or admin in session
    if(req.session.user || req.session.admin){
        req.session.destroy(function(err){
            res.redirect('/')
        }) 
    }
    // If user or admin isn't in session
    else{
        var err = new Error(`Can't log out because no user or admin logged in`)
        //console.error(err.message) 
        next(err)
    }
})
app.get('/admin', function(req, res, next){
    // If a user in session then redirect to '/' (routes to profile page)
    if(req.session.user)
        res.redirect('/')
    // If admin is in session then show admin profile page
    else if(req.session.admin)
        Admin.findOne({username: req.body.identifier, password: req.body.password}, function(err, admin){
            // Render admin profile page and show users
            User.find(function(err, users){
                res.render('admin', {users: users})
            })
        })
    // Open admin login page otherwise
    else
        res.render('adminLogIn', {err: null})
})
// GOTO: More validation procedures must still be added
// Signup form submission procedure
app.post('/signup', function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    // If admin in session then simply redirect to admin profile page
    else if(req.session.admin)
        res.redirect('/admin')
    // Otherwise if a user is not in session
    else{
        // Create a new account on coinbase
        client.createAccount({name: req.body.username.toLowerCase()}, function(err, account) {
            // If account null (coinbase API does not work) then make account.id = ""
            // Ensures server works without coinbase API
            if(!account){
                account = {id:''}// Create a new user based on submitted form details
                console.log("App: Account could not be created")
            }
            // console.log('going to     create an account now')
            // Create a public key address
            account.createAddress(null, function(err, addr) {
                // console.log('addr: ' + addr)
                // Create a new user based on submitted form details and public key generated
                var newUser = User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    username: req.body.username.toLowerCase(),
                    email: req.body.email.toLowerCase(), 
                    password: req.body.password,
                    coinbaseid: account.id,
                    publicKey: addr.address
                })
                // Save the new input user. If err occurs then pass to error handling middleware
                newUser.save(function(err, user, numAffected){
                    if(err) {
                        // Print out the error to console
                        console.log('\x1b[31m', 'App: ')
                        console.log('\x1b[31m', err)
                        // Convert the error object into a meaningful user-oriented messaged
                        errorMessage = translateError(err)
                        // Render signup.ejs with an error notification
                        res.render('signup', {err: errorMessage})
                    }
                    else{
                        // Store all the DB user details in session for duration of session
                        req.session.user = user
                        res.redirect('/')
                    }
                })
            })
        })
    } 
})
// User login form submission procedure
app.post('/login', function(req, res, next){
    // If user in session then redirect to '/'
    if(req.session.user)
        res.redirect('/')
    // If admin in session then simply redirect to admin profile page
    else if(req.session.admin)
        res.redirect('/admin')
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
// Admin login form submission procedure
app.post('/admin', function(req, res, next){
    // If admin in session then simply redirect to admin profile page
    if(req.session.admin)
        res.redirect('/admin')
    // If user in session then simply redirect to index page (user profile page)
    else if(req.session.user)
        res.redirect('/')
    // If admin found in DB then execute callback
    else{
        Admin.findOne({username: req.body.identifier, password: req.body.password}, function(err, admin){
            // If an admin is found then set admin session and show admin profile page
            if(admin){  
                // Set admin session
                req.session.admin = {username: req.body.identifier, password: req.body.password}
                // Render admin profile page and show users
                User.find(function(err, users){ 
                    res.render('admin', {users: users})
                })
            }
            // If an admin is not found then show admin login page with an error message
            else
                res.render('adminLogIn', {err: 'Username or password incorrect'})
        })
    }
})
// Send bitcoin from user account if user is logged in
app.post('/sendbtc', function(req, res, next){
    if(req.session.user){
        //console.log('in')
        console.log(req.body)
        // Check if the bitcoin address is valid
        console.log(req.body.address)
        if(!bitcoinAddress.validate(req.body.address)){
            // If not valid then set error message in session and redirect back to profile
            req.session.user.error_message = 'invalid bitcoin address'
            res.redirect('/')
        }
        // If the bitcoin address is valid then transact
        else{
            // Get account based on coinbase ID
            client.getAccount(req.session.user.coinbaseid, function(err, account) {
                account.sendMoney({'to': req.body.address,
                                   'amount': req.body.btcval,
                                   'currency': 'BTC'},
                function(err, tx) 
                {
                    console.log(err); console.log(tx)
                    // console.log('typeof: ' + typeof(err))
                    // console.log('err.name' + err.name)
                    // console.log('err.message' + err.message)
                    // Check if error is present and if 'err' is a Validation error
                    if(err && err.name === 'ValidationError'){
                        req.session.user.error_message = err.message
                        res.redirect('/')
                    }
                    else if(err){
                        console.log('Some other sort of error occured')
                    }
                    else{
                        console.log('transaction occured: ')
                        console.log(tx)
                        req.session.user.success_message = 'Success! You can view your transaction details here: ' + tx.id
                        res.redirect('/')
                    }
                })
            })
        }
    }
    else
        // Moves on to the app.use which starts an error
        next()
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