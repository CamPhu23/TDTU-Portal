const { OAuth2Client } = require('google-auth-library')
const CLIENT_ID = "591004915054-1kjagbh4omn10rg7n36g8p7up4qrv058.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID)
const userModel = require('../models/user')

const { validationResult } = require('express-validator')

exports.getLogin = (req, res) => {
    res.render('pages/login', { email: '', pass: '' })
}

exports.postGoogleLogin = (req, res) => {
    let { id_token } = req.body

    let user = {}
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        user.email = payload.email;
        user.name = payload.name;
        user.picture = payload.picture;
    }

    verify()
        .then(() => {
            domain = user.email.split("@")[1]

            if (domain === "student.tdtu.edu.vn") {
                // res.cookie("session-token", id_token)
                res.send({ "result": "success" })


                // let account = userModel.findOne().
                //                         where(email).equals(email)

                // if (account.length === 0) {
                //     user = new userModel(user.email, user.name + "123", user.name, user.picture, "3")

                //     //Làm tời đây
                //     user.save()
                //     .then()
                //     .catch()
                // }
            } else {
                res.send({ "result": "Không thuộc tên miền student.tdtu.edu.vn" })
            }
        })
        .catch((err) => {
            console.log(err)
            res.send({ "result": err })
        });
}

exports.postLogin = (req, res) => {
    const result = validationResult(req);
    if (result.errors.length !== 0) {
        res.end(result.errors[0].msg)
    }

    let { email, pass } = req.body

    let account = userModel.findOne().
    where(email).equals(email)

    if (account.length !== 0 && account.password == pass) {
        res.send("Tồn tại tài khoản")
    }

    res.send("Bị sai tài khoản hoặc mật khẩu")
}


exports.getDepartmentlist = (req, res) => {
    res.render('pages/departmentlist')
}

exports.getNotification = (req, res) => {
    res.render('pages/notification')
}

exports.getProfile = (req, res) => {
    res.render('pages/profile')
}

exports.getRegister = (req, res) => {
    res.render('pages/register')
}

exports.getChangePassword = (req, res) => {
    res.render('pages/changePassword')
}