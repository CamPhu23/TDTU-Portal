const mongoose = require('mongoose')
const Post = require('../models/postModel')
const fs = require('fs');
const { auth } = require('google-auth-library');

exports.showHomepage = (req, res) => {
    res.render('pages/home')
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
    let newPost = new Post({
        author: null, //just for test -> will be adjust later
        content,
        imgUrl,
        videoUrl: video ? video : null,
    });

    newPost.save((err, result) => {
        if (err) return res.json({status: false, error: err.message});
        else return res.json({status: true, result});
    })
}

exports.handleDetelePost = (req, res) => {
    let id = req.params.id

    Post.findByIdAndDelete({ _id: id }, function (err, deleted) {
        if (deleted) {
            deleted.imgUrl.forEach(img => {
                fs.unlinkSync('uploads/posts/' + img.split('/')[2])
            })

            return res.json({result: true, deleted: deleted._id})
        } 
        else if (err || !deleted) return res.json({result: false, error: err})
      });
}

exports.handleAddNewComment = (req, res) => {
    let id = req.params.id
    let {content, author} = req.body

    if(!content || !author) {
        return res.json({result: false, message: 'Not enough params'})
    }

    Post.findOneAndUpdate(
        { _id: id }, 
        { $push: { comments: {content, author} } },
        {new: true},
        (err, updated) => {
            if (err) return res.json({result: false, message: err.message})
            
            let newComment = updated.comments[updated.comments.length - 1]
            return res.json({result: true, comment: newComment})
        }
    )
}

exports.handleDeteleComment = (req, res) => {
    let {idPost, idComment} = req.params

    Post.findByIdAndUpdate(
        { _id: idPost },
        { $pull: { comments: { _id: idComment } } },
        { new: true }, 
        (err, result) => {
            console.log(result);
            if (err) return res.json({result: false, message: err.message})
            return res.json({result: true, deleted: idComment})
        }
    )
}

exports.handleGetAllComments = (req, res) => {
    let id = req.params.id

    Post.findById(id, 'comments -_id', (err, result) => {
        if (err) return res.json({result: false, message: err.message})
        return res.json({result: true, comments: result.comments})
    })
}

exports.handleUpdateComment = (req, res) => {
    let {idPost, idComment} = req.params
    let {content} = req.body

    Post.findOneAndUpdate({_id: idPost, comments: {$elemMatch: {_id: idComment}}},
        {$set: {'comments.$.content': content}},
        {'new': true},
        (err, result) => {
            let updateIndex = result.comments.findIndex(comment => comment._id == idComment)
            let updatedComment = result.comments[updateIndex]
            if (err) return res.json({result: false, message: err.message})
            return res.json({result: true, updated: updatedComment})
        }
    )
}