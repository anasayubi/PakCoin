var mongoose = require("mongoose")
var bcrypt = require("bcrypt-nodejs")
var SALT_FACTOR = 10
 
var userSchema = mongoose.Schema({
    // RegExp picked up online. Numbers should not be allowed 
    firstName: {type: String, match: /^[a-z ,.'-]+$/i, required: true},
    // RegExp picked up online. Numbers should not be allowed
    lastName: {type: String, match: /^[a-z ,.'-]+$/i, required: true},
    // RegExp self-made. 
    // Must be at least 5 chars and allow alphanum, underscores, hyphens and dots
    username: { type: String, required: true, unique: true, match: /(?=)[a-z0-9/_/./-]{5,}/i },
    // RegExp picked up online. Covers 99.9% of all emails
    email: { type: String, required: true, unique: true, match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ },
    // RegExp picked up online. Must be at least 8 chars, have 1 alpha and 1 num char
    password: { type: String, required: true, match: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/ },
    bitcoinVal: {type: Number, 'default': 0},
    createdAt: { type: Date, 'default': Date.now },
    // Coinbase ID that will be used to access user wallet
    // Each user will have his/her own ID
    coinbaseid: String
})

userSchema.methods.checkPassword = function(guess, done) {
    bcrypt.compare(guess, this.password, function(err, isMatch) {
        done(err, isMatch);
    });
};

var noop = function() {};

userSchema.pre("save", function(done) {
    var user = this;
    if (!user.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop, function(err, hashedPassword) {
            if (err) { return done(err); }
            user.password = hashedPassword;
            done();
        });
    });
});


module.exports = mongoose.model("User", userSchema)