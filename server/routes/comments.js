const express = require('express');
const router = express.Router();
const { show, add, addS, remove } = require('../controllers/commentController')
const isLogin = require('../middlewares/isLogin')

router.get('/', show)
router.post('/', isLogin, add)
router.post('/stack', isLogin, addS)
router.delete('/:id', isLogin, remove)

module.exports = router;