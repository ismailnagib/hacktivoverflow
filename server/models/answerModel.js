const mongoose = require('mongoose')
const Schema = mongoose.Schema

const answerSchema = new Schema({
    words: {
      type: String,
      required: true
    },
    answerer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 2
    },
    answers: [{
      type: Schema.Types.ObjectId,
      ref: 'Answer'
    }],
    upvote: Array,
    downvote: Array,
    vote: {
      type: Number,
      default: 0
    }
}, {
  timestamps: true
});

const Answer = mongoose.model('Answer', answerSchema)
module.exports = Answer