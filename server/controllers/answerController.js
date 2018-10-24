const Answer = require('../models/answerModel')
const Question = require('../models/questionModel')
const kue = require('kue')
const queue = kue.createQueue()

module.exports = {
    
    show: function(req, res) {
        Answer.find({})
        .populate('answerer')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    add: function(req, res) {
        if (!req.body.questionId || req.body.questionId.length === 0) {
            res.status(500).json({message: 'If you get this message, you must have changed something on the client side, please reload the page and try again.'})
        } else if (!req.body.words || req.body.words.length === 0) {
            res.status(500).json({message: 'An answer has to have a content'})
        } else {
            Answer.create({
                words: req.body.words,
                answerer: req.userId
            })
            .then(answer => {
                Question.findById(req.body.questionId)
                .populate('author')
                .then(question => {
                    let answers = question.answers
                    answers.push(answer._id)
                    Question.updateOne({
                        _id: req.body.questionId
                    }, {
                        answers: answers
                    })
                    .then(data => {
                        if (JSON.stringify(question.author._id) !== JSON.stringify(answer.answerer)) {
                            queue.create('email', {  
                                title: 'Someone answered your question!',
                                to: question.author.email,
                                template: `<h2>Hi, ${question.author.name}.</h2>
                                <p>Someone has answered your question, perhaps you'll want to check it out here: http://localhost:8080/${req.body.questionId}</p>
                                <p>With love,</p>
                                <p><strong>The Hackerflow Team</strong></p>`
                            }).save()
                        }
                        
                        res.status(201).json({data: answer})
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
        if (!req.body.answerId || req.body.answerId.length === 0) {
            res.status(500).json({message: 'If you get this message, you must have changed something on the client side, please reload the page and try again.'})
        } else if (!req.body.words || req.body.words.length === 0) {
            res.status(500).json({message: 'A reply has to have a content'})
        } else {
            Answer.findById(req.body.answerId)
            .then(parentAnswer => {
                if (parentAnswer.level === 1) {
                    Answer.create({
                        words: req.body.words,
                        answerer: req.userId,
                        level: 2
                    })
                    .then(answer => {
                        let answers = parentAnswer.answers
                        answers.push(answer._id)
                        Answer.updateOne({
                            _id: req.body.answerId
                        }, {
                            answers: answers
                        })
                        .then(data => {
                            res.status(201).json({data: answer})
                        })
                        .catch(err => {
                            res.status(500).json({message: err})
                        })
                    })
                } else {
                    res.status(500).json({message: 'An answer may only be owned by a question or a level 1 answer'})
                }
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    edit: function (req, res) {
        if (!req.body.words || req.body.words.length === 0) {
            res.status(500).json({message: 'An answer has to have a content'})
        } else {
            Answer.updateOne({
                _id: req.params.id
            }, {
                words: req.body.words
            })
            .then(() => {
                res.status(200).json({})
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    remove: function(req, res) {
        Answer.findOne({
            _id: req.params.id,
            answerer: req.userId
        })
        .then(data => {
            Answer.deleteOne({
                _id: req.params.id,
                answerer: req.userId
            })
            .then(() => {
                if (data.level === 1) {
                    Answer.deleteMany({
                        _id: {
                            $in: data.answers
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
    },

    upvote: function(req, res) {
        Answer.findById(req.body.id)
        .then(data => {
            if (data.answerer != req.userId) {
                let downvotes = data.downvote
                let upvotes = data.upvote
                let i = upvotes.indexOf(req.userId)
                if (i !== -1) {
                    upvotes.splice(i, 1)
                } else {
                    let j = downvotes.indexOf(req.userId)
                    if (j !== -1) {
                        downvotes.splice(j, 1)
                    }
                    upvotes.push(req.userId)
                }
                let votes = upvotes.length - downvotes.length
                Answer.updateOne({
                    _id: req.body.id
                }, {
                    upvote: upvotes,
                    downvote: downvotes,
                    vote: votes
                })
                .then(success => {
                    res.status(200).json({message: success})
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })
            } else {
                res.status(500).json({message: "You can't upvote yourself"})
            }
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    downvote: function(req, res) {
        Answer.findById(req.body.id)
        .then(data => {
            if (data.answerer != req.userId) {
                let upvotes = data.upvote
                let downvotes = data.downvote
                let i = downvotes.indexOf(req.userId)
                if (i !== -1) {
                    downvotes.splice(i, 1)
                } else {
                    let j = upvotes.indexOf(req.userId)
                    if (j !== -1) {
                        upvotes.splice(j, 1)
                    }
                    downvotes.push(req.userId)
                }
                let votes = upvotes.length - downvotes.length
                Answer.updateOne({
                    _id: req.body.id
                }, {
                    upvote: upvotes,
                    downvote: downvotes,
                    vote: votes
                })
                .then(success => {
                    res.status(200).json({message: success})
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })
            } else {
                res.status(500).json({message: "You can't downvote yourself"})
            }
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    }
}