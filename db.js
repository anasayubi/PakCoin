var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/PakCoin';
// remove comments when shifted to Heroku
/*if (process.env.NODE_ENV === 'production') {
    dbURI = process.env.MONGOLAB_URI;
}*/

// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
    console.log('App: Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
    console.log('App: Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
    console.log('App: Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('App: Mongoose disconnected through ' + msg);
        callback();
    });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});
// For app termination
process.on('SIGINT', function() {
    gracefulShutdown('app termination', function() {
        process.exit(0);
    });
});
// For Heroku app termination
process.on('SIGTERM', function() {
    gracefulShutdown('Heroku app termination', function() {
        process.exit(0);
    });
});

// Attempt to connect to mongodb
// Show appropriate log on success or failure to connect
// Parameters from app.js 
module.exports = function(app, port){
    mongoose.connect(dbURI, function(err){
        app.listen(port, function(){
        if(err)
            console.log(`App: Server could not start on port ${port}`)
        else
            console.log(`App: Server started on port ${port}`)
        })
    })
}