const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
    words: {
        type: String,
        required: true
    },
    commenter: {
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
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }]
}, {
  timestamps: true
});

const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment