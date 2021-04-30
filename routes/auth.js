const express = require('express')
const authController = require('../controllers/authController')
const loginValidator = require('../middleware/loginValidator')
const isAuthed = require('../middleware/isAuthed')
const passport = require('passport')
const router = express.Router()

router.use(passport.initialize())
router.use(passport.session())

router.get('/login', isAuthed, authController.getLogin)
router.get('/google', isAuthed, authController.configPasspostLoginWithGG)
router.get('/google/callback', isAuthed, authController.configPasspostProcess, authController.googleLoginSuccess)

router.post('/login', isAuthed, loginValidator, authController.postLogin)
router.get('/logout', authController.logout)

module.exports = router