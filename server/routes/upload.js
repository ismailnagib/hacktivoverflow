'use strict'
const router = require('express').Router()
const images = require('../helpers/images')
const isLogin = require('../middlewares/isLogin')


router.post('/',
    isLogin,
    images.multer.single('image'), 
    images.sendUploadToGCS,
    (req, res) => {
        res.send({
            status: 200,
            message: 'Your file is successfully uploaded',
            link: req.file.cloudStoragePublicUrl
        })
    }
)

module.exports = router