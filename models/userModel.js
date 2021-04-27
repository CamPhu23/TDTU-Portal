const mongoose = require('mongoose')

const Schema = mongoose.Schema

const user = new Schema({
    email: {
        type: String,
        unique: true
    },
    fullname: String,
    avatar: {type: String, default: "/resources/avatars/TDTU_logo.png"},
    class: {type: String, default: null},
    department: {type: String, default: null},
})

module.exports = mongoose.model('Users', user)