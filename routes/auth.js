const express = require('express')

const authController = require('../controllers/auth')
// const userModel = require('../models/user')

const loginValidator = require('../middleware/loginValidator')

const Router = express.Router()

Router.get('/login', authController.getLogin)

Router.post('/googlelogin', authController.postGoogleLogin)

Router.post('/login', loginValidator, authController.postLogin)

module.exports = Router