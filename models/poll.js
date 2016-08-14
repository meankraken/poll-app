var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PollSchema = new Schema({
    question: String,
    options: [{ title: String, votes: Number }],
    usersVoted: [String],
    ipsVoted: [String],
    creator: String 
});

module.exports = mongoose.model('Poll', PollSchema);