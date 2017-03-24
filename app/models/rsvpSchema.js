// app/models/rsvp.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var rsvpSchema = mongoose.Schema({

    user : String,
    location : String,
    date : Date

});

// methods ======================

// create the model for users and expose it to our app
module.exports = mongoose.model('RSVP', rsvpSchema);