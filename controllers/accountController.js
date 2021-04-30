const accountModel = require("../models/accountModel")
const userModel = require("../models/userModel")
const bcryptjs = require("bcryptjs")
const {validationResult} = require('express-validator')
const { validate } = require("../models/accountModel")

exports.getRegister = (req, res) => {
    let username = req.flash('usernameRegister') || ''
    let password = req.flash('passwordRegister') || ''
    let re_password = req.flash('re_passwordRegister') || ''
    let department = req.flash('departmentRegister') || ''
    let error = req.flash('errorRegister') || ''

    res.render('pages/register', {username, password, re_password, department, error, url: req.currentURL})
}

exports.postRegister = (req, res) => {
    const result = validationResult(req);
    let {department, username, password, re_password} = req.body

    req.flash('departmentRegister', department)
    req.flash('usernameRegister', username)
    req.flash('passwordRegister', password)
    req.flash('re_passwordRegister', re_password)

    if (result.errors.length !== 0) {
        req.flash('errorRegister', result.errors[0].msg)

        return res.redirect('/account/register')
    }

    let departments = ["phòng công tác học sinh sinh viên (cthhsv)", "phòng đại học", 
    "phòng sau đại học", "phòng điện toán và máy tính", 
    "phòng khảo thí và kiểm định chất lượng", 
    "phòng tài chính", "tdt creative language center", 
    "trung tâm tin học", "trung tâm đào tạo phát triển xã hội (sdtc)", 
    "trung tâm phát triển khoa học quản lý và ứng dụng công nghệ (atem)", 
    "trung tâm hợp tác doanh nghiệp và cựu sinh viên", "khoa luật", "trung tâm ngoại ngữ - tin học – bồi dưỡng văn hóa", 
    "viện chính sách kinh tế và kinh doanh", "khoa mỹ thuật công nghiệp", 
    "khoa điện – điện tử", "khoa công nghệ thông tin", "khoa quản trị kinh doanh", 
    "khoa môi trường và bảo hộ lao động", "khoa lao động công đoàn", 
    "khoa tài chính ngân hàng", "khoa giáo dục quốc tế"]

    info = req.body
    if (departments.includes(info.department.toLowerCase())) { 

        accountModel.findOne({username: info.username})
        .then((account) => {
            if (account) {
                req.flash('errorRegister', "Tên tài khoản đã tồn tại")

                return res.redirect("/account/register")
            } else {

                let newUser = new userModel({
                    fullname: info.department, 
                    department: info.department, 
                    email: info.username + "@tdtu.edu.vn",
                })

                newUser.save(function (err) {
                    if (err) return handleError(err)

                    let hashed = bcryptjs.hashSync(info.password, 10)
                    newAccount = new accountModel({
                        username: info.username, 
                        password: hashed, 
                        permission: info.permissions,
                        user: newUser._id
                    })

                    newAccount.save(function(err) {
                        if (err) return handleError(err);

                        res.redirect('/account/register')
                    })
                })
            }
        })
        .catch(error => console.log(error))

    } else {
        req.flash('errorRegister', "Tên Phòng/Khoa không hợp lệ")

        return res.redirect("/account/register")
    }
}

exports.getResetPassword = (req, res) => {
    
    let password = req.flash('passwordResetPassword') || '' 
    let error = req.flash('errorResetPassword') || ''

    res.render('pages/changePassword', {password, error, url: req.currentURL})
}

exports.postResetPassword = (req, res) => {
    const result = validationResult(req);
    let {password, newpassword} = req.body

    req.flash('passwordResetPassword', password)

    if (result.errors.length !== 0) {
        req.flash('errorResetPassword', result.errors[0].msg)

        return res.redirect('/account/resetPassword')
    }

    let id = req.session.accountId
    accountModel.findById(id)
    .then(account => {

        let verify = bcryptjs.compareSync(password, account.password)
        if (account && verify) {

            let hased = bcryptjs.hashSync(newpassword, 10)
            accountModel.findByIdAndUpdate(id, {password: hased}, {new: true})
            .then(account => {
                console.log(account.password);
                return res.redirect('/account/resetPassword')
            })
            .catch(error => console.log(error))

        } else {
            req.flash('errorResetPassword', "Mật khẩu cũ bị sai")
    
            return res.redirect('/account/resetPassword')
        }
    })
    .catch(error => console.log(error))
}

exports.getProfile = (req, res) => { 
    let departmentProfile = req.flash('departmentProfile') || ''
    let classProfile = req.flash('classProfile') || ''
    let fullnameProfile = req.flash('fullnameProfile') || ''
    let emailProfile = req.flash('emailProfile') || ''
    let error = req.flash('errorProfile') || ''

    if (error && error != '') {
        return res.render('pages/profile', {email: emailProfile, fullname: fullnameProfile, _class: classProfile, department: departmentProfile, error, url: req.currentURL})
    }
    
    let userId = req.session.userId
    console.log(req.session.userId);

    userModel.findById(userId)
    .then(user => {

        if (user) {
            let email = user.email || ''
            let fullname = user.fullname || ''
            let avatar = user.avatar || 'http://via.placeholder.com/100'
            let _class = user.class || ''
            let department = user.department || ''

            if (department != '') {
                department = department.toLowerCase()
            }
    
            return res.render('pages/profile', {email, avatar, fullname, _class: _class, department, url: req.currentURL})
        }

        return res.render('pages/profile', {email: '', avatar: 'http://via.placeholder.com/100', fullname: '', _class: '', department: '', url: req.currentURL})
    })
    .catch(error => {
        console.log(error)

    })
    
}

exports.postProfile = (req, res) => {
    const result = validationResult(req);
    let {fullname, _class, department, email} = req.body

    req.flash('departmentProfile', department)
    req.flash('classProfile', _class)
    req.flash('fullnameProfile', fullname)
    req.flash('emailProfile', email)

    if (result.errors.length !== 0) {
        req.flash('errorProfile', result.errors[0].msg)

        return res.redirect('/account/profile')
    }
    let userId = req.session.userId

    
    let avatar
    if (req.file || req.file != undefined) {
        avatar = "/resources/avatars/" + req.file.filename
    } 
    userModel.findByIdAndUpdate(userId, {fullname: fullname, class: _class, department: department, avatar: avatar}, {new: true})
    .then(data => {
        return res.redirect("/account/profile")
    })
    .catch(error => console.log(error))
}