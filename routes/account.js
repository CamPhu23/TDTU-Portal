const express = require('express')
const accountController = require('../controllers/accountController')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/avatars/' })
const registerValidator = require('../middleware/registerValidator')
const updateProfileValidator = require('../middleware/updateProfileValidator')
const resetPasswordValidator = require('../middleware/resetPasswordValidator')
const studentPermission = require('../middleware/studentPermission')
const deparmentPermission = require('../middleware/deparmentPermission')
const adminPermission = require('../middleware/adminPermission')

const Router = express.Router()

Router.get('/resetPassword', deparmentPermission, accountController.getResetPassword)

Router.post('/resetPassword', resetPasswordValidator, accountController.postResetPassword)

Router.get('/register', adminPermission, accountController.getRegister)

Router.post('/register', registerValidator, accountController.postRegister)

Router.get('/profile', studentPermission, accountController.getProfile)

Router.post('/profile', [upload.single('avatar'), updateProfileValidator], accountController.postProfile)

module.exports = Router