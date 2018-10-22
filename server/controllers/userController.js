const User = require('../models/userModel')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {

    register: function(req, res, next) {
        if (req.body.name.length === 0) {
            res.status(500).json({message: 'You should input your name'})
        } else if (/\S+@\S+\.\S+/.test(req.body.email) === false) {
            res.status(500).json({message: 'You should input a valid email address'})
        } else if (req.body.password.length < 6) {
            res.status(500).json({message: 'Password should contain at least 6 characters'})
        } else {
            User.findOne({
                email: req.body.email
            })
            .then (data => {
                if (data) {
                    res.status(500).json({message: 'Email has been registered before'})
                } else {
                    let hashedPassword = bcrypt.hashSync(req.body.password)
                    User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: hashedPassword
                    })
                    .then(data => {
                        res.status(201).json({data: data})
                    })
                    .catch(err => {
                        res.status(500).json({message: err})
                    })
                }
            })
            .catch (err => {
                res.status(500).json({message: 'An error occured during the registration process. Please try again later.'})
            })
        }
    },

    login: function(req, res, next) {
        if(req.body.email.length === 0 && req.body.password.length === 0) {
            res.status(500).json({message: 'You should input your email and password'})
        } else if (req.body.email.length === 0) {
            res.status(500).json({message: 'You should input your email'})
        } else if (req.body.password.length === 0) {
            res.status(500).json({message: 'You should input your password'})
        } else {
            User.findOne({
                email: req.body.email
            }, function(err, user) {
                if(user) {
                    let passwordValid = bcrypt.compareSync(req.body.password.toString(), user.password)
                    if(passwordValid) {
                        let token = jwt.sign({
                            id: user._id,
                            email: user.email,
                            name: user.name
                        }, process.env.JWT_KEY);
                        res.status(200).json({token: token, userId: user._id})
                    } else {
                        res.status(500).json({message: 'Incorrect email and/or password'})
                    }
                } else {
                    res.status(500).json({message: 'Incorrect email and/or password'})
                }
            })
        }
    }
}