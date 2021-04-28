const accountModel = require("../models/accountModel")
const userModel = require("../models/userModel")
const bcryptjs = require("bcryptjs")

exports.getRegister = (req, res) => {
    res.render('pages/register')
}

exports.postRegister = (req, res) => {
    let departments = ["Phòng Công tác học sinh sinh viên (CTHSSV)", "Phòng Đại học", 
    "Phòng Sau đại học", "Phòng Điện toán và máy tính", 
    "Phòng Khảo thí và kiểm định chất lượng", 
    "Phòng Tài chính", "TDT Creative Language Center", 
    "Trung Tâm tin học", "Trung tâm đào tạo phát triển xã hội (SDTC)", 
    "Trung Tâm phát triển Khoa học quản lý và Ứng dụng công nghệ (ATEM)", 
    "Trung Tâm hợp tác doanh nghiệp và cựu sinh viên", "Khoa Luật", "Trung Tâm ngoại ngữ - tin học – bồi dưỡng văn hóa", 
    "Viện Chính sách kinh tế và kinh doanh", "Khoa Mỹ thuật công nghiệp", 
    "Khoa Điện – Điện tử", "Khoa Công nghệ thông tin", "Khoa Quản trị kinh doanh", 
    "Khoa Môi trường và bảo hộ lao động", "Khoa Lao động công đoàn", 
    "Khoa Tài chính ngân hàng", "Khoa Giáo dục quốc tế"]

    info = req.body
    if (departments.includes(info.department)) { 

        accountModel.findOne({username: info.username})
        .then((account) => {
            if (account) {
                console.log("tên tài khoản đã tồn tại");
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
                    })
                })
            }
        })
        .catch(error => console.log(error))

    } else {
        console.log("Không tồn tại phòng này")
    }
}

exports.getResetPassword = (req, res) => {
    res.render('pages/changePassword')
}

exports.postResetPassword = (req, res) => {
    let {password, newpassword} = req.body

    let id = req.session.accountId
    accountModel.findById(id)
    .then(account => {

        let verify = bcryptjs.compareSync(password, account.password)
        if (account && verify) {

            let hased = bcryptjs.hashSync(newpassword, 10)
            accountModel.findByIdAndUpdate(id, {password: hased}, {new: true})
            .then(account => {
                console.log(account.password);
            })
            .catch(error => console.log(error))

        } else {
            console.log("Mật khẩu cũ bị sai");
        }
    })
    .catch(error => console.log(error))
}

exports.getProfile = (req, res) => {
    let resultUpdate = req.flash("resultUpdate")  
    
    let userId = req.session.userId
    userModel.findById(userId)
    .then(user => {

        if (user) {
            let email = user.email || ''
            let fullname = user.fullname || ''
            let avatar = user.avatar || 'http://via.placeholder.com/100'
            let _class = user.class || ''
            let department = user.department || ''
    
            return res.render('pages/profile', {email, avatar, fullname, _class: _class, department, resultUpdate})
        }

        return res.render('pages/profile', {email: '', avatar: 'http://via.placeholder.com/100', fullname: '', _class: '', department: '', resultUpdate})
    })
    .catch(error => {
        console.log(error)
        return res.render('pages/profile', {email: '', avatar: 'http://via.placeholder.com/100', fullname: '', _class: '', department: '', resultUpdate})
    })
    
}

exports.postProfile = (req, res) => {

    let userId = req.session.userId

    let {fullname, _class, department} = req.body
    let avatar = "/resources/avatars/" + req.file.filename
    userModel.findByIdAndUpdate(userId, {fullname: fullname, class: _class, department: department, avatar: avatar}, {new: true})
    .then(data => {
        // req.flash("resultUpdate", "true")

        // return res.redirect("/account/profile")
        console.log(data);
    })
    .catch(error => console.log(error))
}