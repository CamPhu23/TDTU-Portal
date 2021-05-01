const mongoose = require('mongoose')
const Post = require('../models/postModel')
const User = require('../models/userModel')
const getAuthorization = require('../authorization')
const Notifications = require('../models/notificationModel')
const fs = require('fs');

exports.showHomepage = async (req, res) => {

    let {userId, accountId} = req.session
    let permission = accountId ? true: false
    authorization = await getAuthorization.getAuthorization(accountId)

    User.findById(userId)
        .then(user => {
            Notifications.find({})
            .sort({date: 'desc'})
            .limit(10)
            .then(notifications => {
                // console.log(notifications);
                // console.log(user);
                // console.log(permission);
                return res.render('pages/home', { user, permission, notifications, url: req.currentURL, authorization })
            })
        })
        .catch(err => {

        })
}

exports.handleAddNewPost = (req, res) => {
    let files = req.files
    let imgUrl = []
    if (files) {
        files.forEach(file => {
            imgUrl.push('resources/posts/' + file.filename)
        });
    }

    let {author, content, video} = req.body

    let embedUrl = null
    if (video)
        embedUrl = 'https://www.youtube.com/embed/' + video.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];

    let newPost = new Post({
        author, 
        content,
        imgUrl,
        videoUrl: embedUrl
    });

    newPost.save((err, result) => {
        console.log(result);

        if (err) return res.json({status: false, error: err.message});
        return res.json({status: true, result});
    })
}

exports.handleDetelePost = (req, res) => {
    let id = req.params.id

    Post.findByIdAndDelete({ _id: id }, function(err, deleted) {
        if (deleted) {
            deleted.imgUrl.forEach(img => {
                fs.unlinkSync('uploads/posts/' + img.split('/')[2])
            })

            return res.json({ result: true, deleted: deleted._id })
        } else if (err || !deleted) return res.json({ result: false, error: err })
    });
}

exports.handleAddNewComment = (req, res) => {
    let id = req.params.id
    let { content, author } = req.body

    if (!content || !author) {
        return res.json({ result: false, message: 'Not enough params' })
    }

    Post.findOneAndUpdate({ _id: id }, { $push: { comments: { content, author } } }, { new: true },
        (err, updated) => {
            if (err) return res.json({ result: false, message: err.message })

            let newComment = updated.comments[updated.comments.length - 1]
            return res.json({ result: true, comment: newComment })
        }
    )
}

exports.handleDeteleComment = (req, res) => {
    let { idPost, idComment } = req.params

    Post.findByIdAndUpdate({ _id: idPost }, { $pull: { comments: { _id: idComment } } }, { new: true },
        (err, result) => {
            console.log(result);
            if (err) return res.json({ result: false, message: err.message })
            return res.json({ result: true, deleted: idComment })
        }
    )
}

exports.handleGetAllComments = (req, res) => {
    let id = req.params.id

    Post.findById(id, 'comments -_id')
    .populate('comments.author')
    .then(result => {
        return res.json({ result: true, comments: result.comments })
    })
    .catch(err => {
        return res.json({ result: false, message: err.message })
    })
}

exports.handleGetPosts = (req, res) => {
    let {page} = req.params
    let skipPosts = parseInt(page) * 10 - 10

    Post.find({})
        .populate('author')
        .sort({lastUpdate: 'desc'})
        .skip(skipPosts)
        .limit(10)
        .then(posts => {
            return res.json({result: true, posts})
        })
        .catch(err => {
            return res.json({result: false, message: err.message})
        })
}

exports.handleUpdateComment = (req, res) => {
    let { idPost, idComment } = req.params
    let { content } = req.body

    Post.findOneAndUpdate({ _id: idPost, comments: { $elemMatch: { _id: idComment } } }, { $set: { 'comments.$.content': content } }, { 'new': true },
        (err, result) => {
            let updateIndex = result.comments.findIndex(comment => comment._id == idComment)
            let updatedComment = result.comments[updateIndex]
            if (err) return res.json({ result: false, message: err.message })
            return res.json({ result: true, updated: updatedComment })
        }
    )
}

exports.handleUpdatePost = (req, res) => {
    let id = req.params.id
    let files = req.files
    let {author, content, video, change} = req.body

    let embedUrl = null
    if (video) {
        if (video.includes('embed')) embedUrl = video
        else embedUrl = 'https://www.youtube.com/embed/' + video.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/)[1];
    }

    if (change == 'true') {
        let imgUrl = []
        if (files) {
            files.forEach(file => {
                imgUrl.push('resources/posts/' + file.filename)
            });
        }

        Post.findByIdAndUpdate(id, 
            {
                content,
                imgUrl,
                videoUrl: embedUrl,
                lastUpate: Date.now
            },
            {new: true})
        .then(updated => {
            return res.json({status: true, result: updated});
        })
        .catch(err => {
            return res.json({status: false, error: err.message});
        })
    } else if (change == 'false') {
        Post.findByIdAndUpdate(id, 
            {
                content,
                videoUrl: embedUrl,
                lastUpate: Date.now
            },
            {new: true})
        .then(updated => {
            return res.json({status: true, result: updated});
        })
        .catch(err => {
            return res.json({status: false, error: err.message});
        })
    }
}

exports.handleShowPersonalProfile = async (req, res) => {
    let id = req.params.id
    let {userId, accountId} = req.session

    authorization = await getAuthorization.getAuthorization(accountId)


    console.log({userId, id});
    

    User.find({_id: {$in: [userId, id]}})
    .then(users => {
            if (users.length == 1) //it's mean owner profile
                return res.render('pages/personal', {user: users[0], personal: users[0], url: req.currentURL, authorization })
            else {
                let user, personal
                users[0]._id == userId ? (user = users[0], personal = users[1])  : (user = users[1], personal = users[0])
                return res.render('pages/personal', {user, personal, url: req.currentURL, authorization })
            }
                
        })
}

exports.handleGetPostsOfUser = (req, res) => {
    let {page, userId} = req.params
    let skipPosts = parseInt(page) * 10 - 10

    Post.find({author: userId})
        .populate('author')
        .sort({lastUpdate: 'desc'})
        .skip(skipPosts)
        .limit(10)
        .then(posts => {
            // console.log(posts);
            return res.json({result: true, posts})
        })
        .catch(err => {
            return res.json({result: false, message: err.message})
        })
}