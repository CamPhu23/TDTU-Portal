const accountModel = require("../models/accountModel")
const userModel = require("../models/userModel")
const bcryptjs = require("bcryptjs")
const {validationResult} = require('express-validator')

exports.getRegister = (req, res) => {
    let username = req.flash('usernameRegister') || ''
    let password = req.flash('passwordRegister') || ''
    let re_password = req.flash('re_passwordRegister') || ''
    let department = req.flash('departmentRegister') || ''
    let error = req.flash('errorRegister') || ''
    let success = req.flash('SuccessRegister') || ''

    res.render('pages/register', {username, password, re_password, department, error, success, url: req.currentURL})
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

                        req.flash('SuccessRegister', "Tạo tài khoản thành công")

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
    let accountId = req.session.accountId
    let success = req.flash('SuccessResetPass') || ''

    accountModel.findById(accountId)
    .then(account => {
        account.permission == "admin" ? isEditable = true : isEditable = false

        res.render('pages/changePassword', {password, error, isEditable, username: account.username, success, url: req.currentURL})
    })
}

exports.postResetPassword = (req, res) => {
    const result = validationResult(req);
    let {username, password, newpassword} = req.body

    
    if (result.errors.length !== 0) {
        req.flash('passwordResetPassword', password)
        req.flash('errorResetPassword', result.errors[0].msg)

        return res.redirect('/account/resetPassword')
    }

    let id = req.session.accountId
    accountModel.findOne({username})
    .then(account => {

        let verify = bcryptjs.compareSync(password, account.password)
        if (account && verify) {

            let hased = bcryptjs.hashSync(newpassword, 10)
            accountModel.findByIdAndUpdate(id, {password: hased}, {new: true})
            .then(account => {
                console.log(account.password);

                req.flash('SuccessResetPass', "Cập nhật thành công")
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
    let accountId = req.session.accountId
    let isAdmin = false

    accountModel.findById(accountId)
    .then(account => {
        if (account && account.permission == "admin") {
            isAdmin = true
        }
    })

    let departmentProfile = req.flash('departmentProfile') || ''
    let classProfile = req.flash('classProfile') || ''
    let fullnameProfile = req.flash('fullnameProfile') || ''
    let emailProfile = req.flash('emailProfile') || ''
    let error = req.flash('errorProfile') || ''
    let avatarProfile = req.flash('avatarProfile') || 'http://via.placeholder.com/100'
    let success = req.flash('SuccessUpdateProfile') || ''

    if (error && error != '') {
        return res.render('pages/profile', {email: emailProfile, avatar: avatarProfile, fullname: fullnameProfile, _class: classProfile, department: departmentProfile, error, url: req.currentURL, isAdmin})
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
    
            return res.render('pages/profile', {email, avatar, fullname, _class: _class, department, url: req.currentURL, success, isAdmin})
        }

        return res.render('pages/profile', {email: '', avatar: 'http://via.placeholder.com/100', fullname: '', _class: '', department: '', url: req.currentURL})
    })
    .catch(error => {
        console.log(error)

    })
    
}

exports.postProfile = (req, res) => {
    const result = validationResult(req);
    let {fullname, _class, department, email, avatar} = req.body
    let userId = req.session.userId
    
    if (req.file || req.file != undefined) {
        avatar = "/resources/avatars/" + req.file.filename
    } 

    req.flash('departmentProfile', department)
    req.flash('classProfile', _class)
    req.flash('fullnameProfile', fullname)
    req.flash('emailProfile', email)
    
    if (result.errors.length !== 0) {
        userModel.findById(userId)
        .then(user => {
            req.flash('avatarProfile', user.avatar)
            req.flash('errorProfile', result.errors[0].msg)

            return res.redirect('/account/profile')
        })
        
    } else {

        if (avatar != undefined) {

            userModel.findByIdAndUpdate(userId, {fullname: fullname, class: _class, department: department, avatar}, {new: true})
            .then(data => {
                console.log(data);
                req.flash('SuccessUpdateProfile', "Cập nhật thành công")

                return res.redirect("/account/profile")
            })
            .catch(error => console.log(error))

        } else {
            
            userModel.findByIdAndUpdate(userId, {fullname: fullname, class: _class, department: department}, {new: true})
            .then(data => {
                console.log(data);
                req.flash('SuccessUpdateProfile', "Cập nhật thành công")

                return res.redirect("/account/profile")
            })
            .catch(error => console.log(error))

        }
    }

}