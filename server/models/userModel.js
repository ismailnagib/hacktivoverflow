const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
        type: String,
        required: true
    },
    gSignIn: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    starred: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema)
module.exports = User