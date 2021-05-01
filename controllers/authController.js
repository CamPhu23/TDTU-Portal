const accountModel = require("../models/accountModel")
const userModel = require("../models/userModel")
const bcryptjs = require("bcryptjs")
const {validationResult} = require('express-validator')
const passport = require('passport')
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;

//===================== LOGIN PROCESS =====================//
passport.serializeUser((user, cb) => {cb(null, user)})
passport.deserializeUser((obj, cb) => {cb(null, obj)})

//login with GG
const GOOGLE_CLIENT_ID = '329499798329-20pgqrdc6ceh92thup478336a05fijve.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '1lylO_PFcHnX1lQW0g7qLlvJ';

const opts_GG = {
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || "http://localhost:8080/auth/google/callback"
}

let user = undefined, token = undefined

const cb_GG = (accessToken, refreshToken, profile, done) => {
    if (profile._json.hd && profile._json.hd === 'student.tdtu.edu.vn') {
        user = profile._json
        token = accessToken
        return done(null, user);
    } else {
        // req.flash('errorMessages', '');
        return done(null, false, {message: 'Chỉ hỗ trợ đăng nhập bằng mail sinh viên.'});
        //or can add message (using flash messages)
        // return done(null, false, {message: 'Invalid host domain'});
    }
}

passport.use(new googleStrategy(opts_GG, cb_GG))
//end login with google

exports.getLogin = (req, res) => {
    let username = req.flash('usernameLogin') || ''
    let password = req.flash('passwordLogin') || ''

    res.render('pages/login', {username: username, pass: password, url: req.currentURL})
}

exports.configPasspostLoginWithGG = passport.authenticate('google', { scope : ['profile', 'email'] })
exports.configPasspostProcess = passport.authenticate('google', { failureRedirect: '/auth/login', failureFlash: true })

exports.googleLoginSuccess = (req, res) => {
    req.session.user = user.name
    console.log(user);

    userModel.findOne({email: user.email})
    .then((account) => {
        if (!account) {
            let newUser = new userModel({email: user.email, fullname: user.name, avatar: user.picture})

            newUser.save()
            .then(user => {
                req.session.userId = user._id
                res.redirect('/account/profile')
            })
        } else {
            req.session.userId = account._id
            res.redirect('/home')
        }
    })
    .catch(error => console.log(error))
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

exports.logout = (req, res) => {
    req.session.destroy()
    res.redirect('/auth/login')
}