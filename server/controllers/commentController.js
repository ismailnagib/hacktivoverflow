const Comment = require('../models/commentModel')
const Article = require('../models/articleModel')
const User = require('../models/userModel')

module.exports = {
    
    show: function(req, res) {
        Comment.find({})
        .populate('commenter')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    add: function(req, res) {
        if (!req.body.postId || req.body.postId.length === 0) {
            res.status(500).json({message: 'If you get this message, you must have changed something on the client side, please reload the page and try again.'})
        } else if (!req.body.words || req.body.words.length === 0) {
            res.status(500).json({message: 'A comment has to have a content'})
        } else {
            Comment.create({
                words: req.body.words,
                commenter: req.userId
            })
            .then(comment => {
                Article.findById(req.body.postId)
                .then(article => {
                    let comments = article.comments
                    comments.push(comment._id)
                    Article.updateOne({
                        _id: req.body.postId
                    }, {
                        comments: comments
                    })
                    .then(data => {
                        res.status(201).json({data: comment})
                    })
                    .catch(err => {
                        res.status(500).json({message: err})
                    })
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    addS: function(req, res) {
        if (!req.body.commentId || req.body.commentId.length === 0) {
            res.status(500).json({message: 'If you get this message, you must have changed something on the client side, please reload the page and try again.'})
        } else if (!req.body.words || req.body.words.length === 0) {
            res.status(500).json({message: 'A reply has to have a content'})
        } else {
            Comment.findById(req.body.commentId)
            .then(parentComment => {
                if (parentComment.level === 1) {
                    Comment.create({
                        words: req.body.words,
                        commenter: req.userId,
                        level: 2
                    })
                    .then(comment => {
                        let comments = parentComment.comments
                        comments.push(comment._id)
                        Comment.updateOne({
                            _id: req.body.commentId
                        }, {
                            comments: comments
                        })
                        .then(data => {
                            res.status(201).json({data: comment})
                        })
                        .catch(err => {
                            res.status(500).json({message: err})
                        })
                    })
                } else {
                    res.status(500).json({message: 'A comment may only be owned by an article or a level 1 comment'})
                }
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    remove: function(req, res) {
        Comment.findOne({
            _id: req.params.id,
            commenter: req.userId
        })
        .then(data => {
            Comment.deleteOne({
                _id: req.params.id,
                commenter: req.userId
            })
            .then(() => {
                if (data.level === 1) {
                    Comment.deleteMany({
                        _id: {
                            $in: data.comments
                        }
                    })
                    .then(() => {
                        res.status(200).json({})
                    })
                    .catch(err => {
                        res.status(500).json({message: err})
                    })
                } else {
                    res.status(200).json({})
                }
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        })
    }
}