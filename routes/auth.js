const express = require('express')

const authController = require('../controllers/auth')
    // const userModel = require('../models/user')

const loginValidator = require('../middleware/loginValidator')

const Router = express.Router()

Router.get('/login', authController.getLogin)

Router.post('/googlelogin', authController.postGoogleLogin)

Router.post('/login', loginValidator, authController.postLogin)

Router.get('/changePassword', authController.getChangePassword)

Router.get('/departmentlist', authController.getDepartmentlist)

Router.get('/notification', authController.getNotification)

Router.get('/profile', authController.getProfile)

Router.get('/register', authController.getRegister)

module.exports = Router