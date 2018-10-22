const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/userController')
const isLogin = require('../middlewares/isLogin')

router.post('/login', login)
router.post('/checklogin', isLogin, (req, res) => {res.status(200).json({userId: req.userId, userEmail: req.userEmail, userName: req.userName})})
router.post('/register', register)

module.exports = router