var jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    jwt.verify(req.headers.token, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
            next(err.message)
        } else {
            req.userId = decoded.id
            req.userEmail = decoded.email
            req.userName = decoded.name
            next()
        }
    })
}

