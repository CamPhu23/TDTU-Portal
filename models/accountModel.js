const mongoose = require("mongoose")

const Schema = mongoose.Schema

const account = new Schema({
    username: {
        type: String,
        unique: true
    },
    password: String,
    permission: [{type: String}],
    user: {type: Schema.Types.ObjectId, ref: 'Users'}
})
module.exports = mongoose.model("Accounts", account)