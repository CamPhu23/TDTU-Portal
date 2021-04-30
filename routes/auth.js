const express = require('express')

const authController = require('../controllers/authController')

const loginValidator = require('../middleware/loginValidator')

const Router = express.Router()

Router.get('/login', authController.getLogin)

Router.post('/googlelogin', authController.postGoogleLogin)

Router.post('/login', loginValidator, authController.postLogin)

Router.get('/logout', authController.postLogout)

module.exports = Router