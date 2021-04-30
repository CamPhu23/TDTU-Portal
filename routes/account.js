const express = require('express')
const accountController = require('../controllers/accountController')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/avatars/' })
const registerValidator = require('../middleware/registerValidator')
const updateProfileValidator = require('../middleware/updateProfileValidator')
const resetPasswordValidator = require('../middleware/resetPasswordValidator')

const Router = express.Router()

Router.get('/resetPassword', accountController.getResetPassword)

Router.post('/resetPassword', resetPasswordValidator, accountController.postResetPassword)

Router.get('/register', accountController.getRegister)

Router.post('/register', registerValidator, accountController.postRegister)

Router.get('/profile', accountController.getProfile)

Router.post('/profile', [upload.single('avatar'), updateProfileValidator], accountController.postProfile)

module.exports = Router