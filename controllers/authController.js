const {OAuth2Client} = require('google-auth-library')
const CLIENT_ID = "591004915054-1kjagbh4omn10rg7n36g8p7up4qrv058.apps.googleusercontent.com"
const client = new OAuth2Client(CLIENT_ID)
const accountModel = require("../models/accountModel")
const userModel = require("../models/userModel")

const {validationResult} = require('express-validator')

exports.getLogin = (req, res) => {
    res.render('pages/login', {username: '', pass: '', errorMess: ''})
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
            res.send({"result": "success"})

            userModel.findOne({email: user.email})
            .then((account) => {
                if (!account || account.length === 0) {
                    user = new userModel({email: user.email, fullname: user.name, avatar: user.picture})
    
                    user.save((user) => {
                        // res.cookie("session-token", user_.id)
                        req.session.userId = user._id
                    })
                    .catch(error => console.log(error))
                }
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
    console.log(req.body);

    if (result.errors.length !== 0) {
        return res.render('pages/login', {username: username, pass: pass, 
                                    errorMess: result.errors[0].msg})
    }

    accountModel.findOne({username: username})
    .then((account) => {
        
        if (account && account.length !== 0 && account.password === pass) {
            req.session.userId = account._id
            
            return res.render('pages/home')
        }
        
        return res.render('pages/login', {username: username, pass: pass, errorMess: "Tài khoản hoặc mật khẩu bị sai"})
    })
    .catch(error => console.log(error))
}


exports.getRegister = (req, res) => {
    res.render('pages/register')
}

exports.getChangePassword = (req, res) => {
    res.render('pages/changePassword')
}