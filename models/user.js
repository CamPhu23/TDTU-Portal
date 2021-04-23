const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    password: String,
    fullname: String,
    avatar: String,
    permission: String
})

module.exports = mongoose.model('User', userSchema)