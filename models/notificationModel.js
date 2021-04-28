const mongoose = require('mongoose')

const Schema = mongoose.Schema

const notification = new Schema({
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    subject: [{ type: String, default: "" }],
    files: [{ type: String, default: "" }],
    date: { type: Date, default: Date.now },

    author: { type: Schema.Types.ObjectId, ref: "Users" }
})

module.exports = mongoose.model("Notifications", notification)