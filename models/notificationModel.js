const mongoose = require('mongoose')

const Schema = mongoose.Schema

const notifySchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'Users' },
    content:   String,
    department: String,
    date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Notifications', notifySchema)