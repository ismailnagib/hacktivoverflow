const express = require('express');
const router = express.Router();
const { login, register, glogin, getStarred } = require('../controllers/userController')
const isLogin = require('../middlewares/isLogin')

router.get('/glogin', glogin)
router.get('/starred', isLogin, getStarred)
router.post('/login', login)
router.post('/checklogin', isLogin, (req, res) => {res.status(200).json({userId: req.userId, verified: req.verified})})
router.post('/register', register)

module.exports = router