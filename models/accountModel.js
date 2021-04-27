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

// const AccountModel = mongoose.model("Accounts", account) 

// const admin = new AccountModel({
//     username: "admin",
//     password: "admin123",
//     permission: "admin",
// })

// admin.save(function (err) {
//     if (err) return handleError(err)
// })

// module.exports = AccountModel
module.exports = mongoose.model("Accounts", account)