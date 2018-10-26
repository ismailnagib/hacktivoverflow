const Question = require('../models/questionModel')
const Answer = require('../models/answerModel')
const User = require('../models/userModel')

module.exports = {
    
    show: function(req, res) {
        Question.find({}, null, {
            sort: {
                title: 'ASC'
            }
        })
        .populate('author')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    showOne: function(req, res) {
        Question.findById(req.params.id)
        .populate('author')
        .populate({
            path: 'answers',
            populate: {
                path: 'answerer'
            }
        })
        .populate({
            path: 'answers',
            populate: {
                path: 'answers',
                populate: {
                    path: 'answerer'
                }
            }
        })
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    showMine: function(req, res) {
        Question.find({
            author: req.userId
        })
        .populate('author')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    add: function(req, res) {
        if ((!req.body.title && !req.body.content) || (req.body.title.length === 0 && req.body.content.length === 0)) {
            res.status(500).json({message: 'A question has to have a title and a content'})
        } else if (!req.body.title || req.body.title.length === 0) {
            res.status(500).json({message: 'A question has to have a title'})
        } else if (!req.body.content || req.body.content.length === 0) {
            res.status(500).json({message: 'A question has to have a content'})
        } else {
            if (!req.body.image || req.body.image.length === 0) {
                req.body.image = 'https://via.placeholder.com/700x250'
            }
            Question.create({
                title: req.body.title,
                content: req.body.content,
                author: req.userId,
            })
            .then(data => {
                res.status(201).json({data: data})
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    edit: function(req, res) {
        if ((!req.body.title && !req.body.content) || (req.body.title.length === 0 && req.body.content.length === 0)) {
            res.status(500).json({message: 'A question has to have a title and a content'})
        } else if (!req.body.title || req.body.title.length === 0) {
            res.status(500).json({message: 'A question has to have a title'})
        } else if (!req.body.content || req.body.content.length === 0) {
            res.status(500).json({message: 'A question has to have a content'})
        } else {
            Question.updateOne({
                _id: req.params.id,
                author: req.userId
            }, {
                title: req.body.title,
                content: req.body.content
            })
            .then(data => {
                res.status(200).json({data: data})
            })
            .catch(err => {
                res.status(500).json({message: err})
            })
        }
    },

    remove: function(req, res) {
        Question.findById(req.params.id)
        .then(question => {
            if (question.answers.length === 0) {
                qDel()
            } else {
                Answer.find({
                    _id: {
                        $in: question.answers
                    }
                })
                .then(answers => {
                    for (let i = 0; i < answers.length; i++) {
                        if (answers[i].level === 1) {
                            Answer.deleteMany({
                                _id: {
                                    $in: answers[i].answers
                                }
                            })
                            .then(() => {
                                if (i === answers.length - 1) {
                                    aDel()
                                }
                            })
                            .catch(err => {
                                res.status(500).json({message: err})
                            })
                        } else {
                            if (i === answers.length - 1) {
                                aDel()
                            }
                        }
                    }
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })

                function aDel() {
                    Answer.deleteMany({
                        _id: {
                            $in: question.answers
                        }
                    })
                    .then(() => {
                        qDel()
                    })
                    .catch(err => {
                        res.status(500).json({message: err})
                    })
                }
            }

            function qDel() {
                Question.deleteOne({
                    _id: req.params.id,
                    author: req.userId 
                })
                .then(() => {
                    res.status(200).json({})
                })
                .catch(err => {
                    res.status(500).json({message: err})
                })
            }
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    search: function(req, res) {
        Question.find({
            title: new RegExp(req.query.keyword, 'i')
        }, null, {
            sort: {
                title: 'ASC'
            }
        })
        .populate('author')
        .then(data => {
            res.status(200).json({data: data})
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    },

    upvote: function(req, res) {
        Question.findById(req.body.id)
        .then(data => {
            if (data.author != req.userId) {
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
                Question.updateOne({
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
        Question.findById(req.body.id)
        .then(data => {
            if (data.author != req.userId) {
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
                Question.updateOne({
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
    },

    starToggle: function(req, res) {
        Question.findById(req.body.id)
        .then(data => {
            if (data.author != req.userId) {
                User.findById(req.userId)
                .then(user => {
                    let starred = user.starred
                    let star = data.star
                    let i = starred.indexOf(req.body.id)
                    if (i !== -1) {
                        starred.splice(i, 1)
                        star --
                    } else {
                        starred.push(req.body.id)
                        star ++
                    }
                    Question.updateOne({
                        _id: req.body.id
                    }, {
                        star: star
                    })
                    .then(() => {
                        User.updateOne({
                            _id: req.userId
                        }, {
                            starred: starred
                        })
                        .then(() => {
                            res.status(200).json({})
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
            } else {
                res.status(500).json({message: "You can't star your own question"})
            }
        })
        .catch(err => {
            res.status(500).json({message: err})
        })
    }
}