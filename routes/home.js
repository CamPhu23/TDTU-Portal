const express = require('express')
const homeController = require('../controllers/homeController')
const router = express.Router()
const multer  = require('multer')
const postUploader = multer({ dest: 'uploads/posts' })

router.get('/', homeController.showHomepage)
router.post('/addNewPost', postUploader.array('images'), homeController.handleAddNewPost)
router.delete('/deletePost/:id', homeController.handleDetelePost)
router.post('/addNewComment/:id', postUploader.none(), homeController.handleAddNewComment)
router.delete('/deleteComment/:idPost/:idComment', homeController.handleDeteleComment)
router.get('/getComments/:id', homeController.handleGetAllComments)
router.post('/updateComment/:idPost/:idComment', postUploader.none(), homeController.handleUpdateComment)
router.get('/getPosts/:page', homeController.handleGetPosts)
router.post('/updatePost/:id', postUploader.array('images'), homeController.handleUpdatePost)
router.get('/wall/:id', homeController.handleShowPersonalProfile)
router.get('/getPostsOfUser/:userId/:page', homeController.handleGetPostsOfUser)

module.exports = router