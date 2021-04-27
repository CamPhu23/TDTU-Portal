const mongoose = require('mongoose')

const Schema = mongoose.Schema

const postSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    content:   String,
    comments: [{ 
        content: String, 
        author: { type: Schema.Types.ObjectId, ref: 'Users' },
        date: { type: Date, default: Date.now } 
    }],
    imgUrl: [{type: String, default: null}],
    videoUrl: {type: String, default: null},
    lastUpdate: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Posts', postSchema)