const Answer = require('../models/answerModel')
const Question = require('../models/questionModel')

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
                .then(question => {
                    let answers = question.answers
                    answers.push(answer._id)
                    Question.updateOne({
                        _id: req.body.questionId
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
    }
}