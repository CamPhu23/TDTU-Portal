const express = require('express')
const accountController = require('../controllers/accountController')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/avatars/' })

const Router = express.Router()

Router.get('/resetPassword', accountController.getResetPassword)

Router.post('/resetPassword', accountController.postResetPassword)

Router.get('/register', accountController.getRegister)

Router.post('/register', accountController.postRegister)

Router.get('/profile', accountController.getProfile)

Router.post('/profile', upload.single('avatar'), accountController.postProfile)

module.exports = Router