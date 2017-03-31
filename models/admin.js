var mongoose = require("mongoose")

// Create Admin Schema
var adminSchema = mongoose.Schema({
    username: String,
    password: String
})

module.exports = mongoose.model("Admin", adminSchema)