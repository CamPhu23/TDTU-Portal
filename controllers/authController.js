const {OAuth2Client} = require('google-auth-library')
const CLIENT_ID = "591004915054-1kjagbh4omn10rg7n36g8p7up4qrv058.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID)
const accountModel = require("../models/accountModel")
const userModel = require("../models/userModel")
const bcryptjs = require("bcryptjs")

const {validationResult} = require('express-validator')

exports.getLogin = (req, res) => {
    let username = req.flash('usernameLogin') || ''
    let password = req.flash('passwordLogin') || ''
    let error = req.flash('errorLogin') || ''

    res.render('pages/login', {username: username, pass: password, errorMess: error})
}

exports.postGoogleLogin = (req, res) => {
    let {id_token} = req.body

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
            userModel.findOne({email: user.email})
            .then((account) => {
                if (!account) {
                    let newUser = new userModel({email: user.email, fullname: user.name, avatar: user.picture})
    
                    newUser.save()
                    .then(user => {
                        req.session.userId = user._id
                    })
                    .catch(error => console.log(error))
                } else {
                    req.session.userId = account._id
                }

                res.send({"result": "success"})
            })
            .catch(error => console.log(error))
            
        } else {
            res.send({"result": "Không thuộc tên miền student.tdtu.edu.vn"})
        }
    })
    .catch((err) => {
        console.log(err)
        res.send({"result": err})
    });
}


exports.postLogin = (req, res) => {
    const result = validationResult(req);
    let {username, pass} = req.body

    if (result.errors.length !== 0) {
        
        req.flash('usernameLogin', username)
        req.flash('passwordLogin', pass)
        req.flash('errorLogin', result.errors[0].msg)

        return res.redirect('/auth/login')
    }

    accountModel.findOne({username: username})
    .populate('user')
    .then((account) => {
        
        let verify = bcryptjs.compareSync(pass, account.password)
        if (account && verify) {

            req.session.accountId = account._id
            req.session.userId = account.user._id

            return res.redirect('/home')
        } else {

            req.flash('usernameLogin', username)
            req.flash('passwordLogin', pass)
            req.flash('errorLogin', 'Tài khoản hoặc mật khẩu bị sai')
            
            return res.redirect('/auth/login')
        }
    })
    .catch(error => console.log(error))
}

exports.postLogout = (req, res) => {
    req.session.destroy()

    res.redirect('/login')
}