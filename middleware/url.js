const express = require('express')
const router = express.Router()

router.use((req, res, next) => {
    req.currentURL = req.protocol + '://' + req.get('host');
    next()
})

module.exports = router