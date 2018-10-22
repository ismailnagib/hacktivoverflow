const express = require('express');
const router = express.Router();
const { show, showOne, showMine, add, edit, remove, search } = require('../controllers/articleController')
const isLogin = require('../middlewares/isLogin')

router.get('/', show)
router.get('/search', search)
router.get('/self', isLogin, showMine)
router.get('/:id', showOne )
router.post('/', isLogin, add)
router.put('/:id', isLogin, edit)
router.delete('/:id', isLogin, remove)

module.exports = router;