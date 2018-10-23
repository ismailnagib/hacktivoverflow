const express = require('express');
const router = express.Router();
const { show, add, addS, remove, upvote, downvote } = require('../controllers/answerController')
const isLogin = require('../middlewares/isLogin')

router.get('/', show)
router.post('/', isLogin, add)
router.post('/stack', isLogin, addS)
router.delete('/:id', isLogin, remove)
router.patch('/upvote', isLogin, upvote)
router.patch('/downvote', isLogin, downvote)

module.exports = router;