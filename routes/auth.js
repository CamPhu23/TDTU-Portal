const express = require('express')
const authController = require('../controllers/authController')
const loginValidator = require('../middleware/loginValidator')
const passport = require('passport')
const router = express.Router()

router.use(passport.initialize())
router.use(passport.session())

router.get('/login', authController.getLogin)
router.get('/google', passport.authenticate('google', { scope : ['profile', 'email'] }))
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), authController.googleLoginSuccess)

router.post('/login', loginValidator, authController.postLogin)
router.get('/logout', authController.logout)

module.exports = router