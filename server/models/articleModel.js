const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleSchema = new Schema({
    image: String,
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    }]
}, {
  timestamps: true
});

const Article = mongoose.model('Article', articleSchema)
module.exports = Article