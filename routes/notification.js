const multer  = require('multer')
const NotiUploader = multer({ dest: 'uploads/notifications' })
const express = require('express')
const router = express.Router()
const notificationController = require('../controllers/notificationController')

router.get('/', notificationController.getNotificationList)
router.post('/createNewNotification', NotiUploader.array('notification_files', 10), notificationController.postCreateNewNotification)
router.get('/details/:id', notificationController.getNotificationDetails)
router.get('/delete/:id', notificationController.deleteNotification)
router.get('/filter', notificationController.getFilterNotification)

module.exports = router