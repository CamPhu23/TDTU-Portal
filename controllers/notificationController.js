const io = require('../socket')
const notificationModel = require('../models/notificationModel')
const userModel = require('../models/userModel')
const accountModel = require('../models/accountModel')

exports.postCreateNewNotification = (req, res) => {

    let {title, content, subject} = req.body

    let files_req = req.files
    let files = []
    files_req.forEach(file => {
        if (!file.mimetype.includes("image")) {
            files.push({Type: file.mimetype, Src: "resources/notifications/" + file.filename + "&" + file.originalname})
        } else {
            files.push({Type: file.mimetype, Src: "resources/notifications/" + file.filename})
        }
    });

    let newNotification = new notificationModel({title, content, subject, files, author: req.session.userId})

    newNotification.save((error, noti) => {
        if (error) return handleError(error)

        let userId = req.session.userId
        userModel.findById(userId)
        .then(user => {

            let author = ''

            if (user) {
                author =  user.fullname
            }
            let link_detail = "/notification/details/" + noti._id

            io.get().emit("new_notification", {author, noti, link_detail})
            res.redirect(link_detail)
        })
        
    })
}

let listDepartment = ["Phòng công tác học sinh sinh viên (CTHSSV)", "Phòng đại học", 
"Phòng sau đại học", "Phòng điện toán và máy tính", 
"Phòng khảo thí và kiểm định chất lượng", 
"Phòng tài chính", "TDT creative Language Center", 
"Trung tâm tin học", "Trung tâm đào tạo phát triển xã hội (SDTC)", 
"Trung tâm phát triển Khoa học quản lý và Ứng dụng công nghệ (ATEM)", 
"Trung tâm hợp tác doanh nghiệp và cựu sinh viên", "Khoa luật", "Trung tâm ngoại ngữ - tin học – bồi dưỡng văn hóa", 
"Viện chính sách kinh tế và kinh doanh", "Khoa mỹ thuật công nghiệp", 
"Khoa điện – Điện tử", "Khoa công nghệ thông tin", "Khoa quản trị kinh doanh", 
"Khoa môi trường và bảo hộ lao động", "Khoa lao động công đoàn", 
"Khoa tài chính ngân hàng", "Khoa giáo dục quốc tế"]

exports.getNotificationList = async (req, res) => {

    let isAdded = false
    let accountId = req.session.accountId
    accountId ? isAdded = true : isAdded = false 
    let permission = []
    let {userId} = req.session

    accountModel.findById(accountId)
    .then(account => {
        if (account) {
            if (account.permission != "admin") {
                permission = account.permission
            } else {
                permission = listDepartment
            }
        }
    })

    let page = req.query.page
    let url = req.currentURL

    if (page <= 0 || (isNaN(page) && isNaN(parseFloat(page)))) {
        page = 1
    }
    let skip = parseInt(page) * 10 - 10

    let department = req.query.department
    if (!department || department == "") {
        department = listDepartment
    }

    let pagi = {page: page}
    notificationModel.countDocuments()
    .where("subject").in(department)
    .exec((error, count) => {
        count % 10 === 0 ? pagi.total = count / 10 : pagi.total = (parseInt(count / 10  + 1)) 
    })
    let pagi_link = url + '/notification?page='

    
    userModel.findById(userId)
    .then(user => {
        notificationModel
        .find({})
        .where("subject").in(department)
        .skip(skip)
        .limit(10)
        .sort({date: -1})
        .exec(function(err, noti) {
    
            let detail_href = []
            noti.forEach(n => {
                detail_href.push(req.protocol + "://" + req.get('host') + "/notification/details/" + n._id)
            })
    
            res.render('pages/notification', {notiList: noti, link: detail_href, pagi, pagi_link, isAdded, permissionNoti: permission, user, url, authorization: req.session.authorization})
        })
    })
}

exports.getNotificationDetails = async (req, res) => {
    let notiId = req.params.id
    let url = req.currentURL
    let accountId = req.session.accountId
    let permission = []
    let {userId} = req.session

    accountModel.findById(accountId)
    .then(account => {
        if (account) {
            if (account.permission != "admin") {
                permission = account.permission
            } else {
                permission = listDepartment
            }
        }
    })

    userModel.findById(userId)
    .then(user => {
        notificationModel.findById(notiId)
        .populate('author')
        .then((noti) => {
            if (!noti) {
                res.redirect('/notification?page=1')
            }

            let isEditable = false
            permission.includes(noti.subject) == true ? isEditable = true : isEditable = false
            console.log(noti.subject);
    
            let delete_href = req.protocol + "://" + req.get('host') + "/notification/delete/" + notiId
    
            res.render('pages/detailsNotification', {noti, delete_href, isEditable, permissionNoti: permission, url, user, authorization: req.session.authorization})
        }) 
        .catch(err => {                
            res.redirect('/notification?page=1')
        })  
    })  
    .catch(err => {                
        res.redirect('/notification?page=1')
    })  
}

exports.deleteNotification = (req, res) => {
    notificationModel.findByIdAndDelete(req.params.id, (error) => {
        if (error) return handleError(error)
    })

    res.redirect('/notification')
}

exports.getFilterNotification = (req, res) => {
    let department = req.query.department

    if (!department) {
        department = ''
    }
    res.redirect('/notification?page=1&department=' + department)
}

exports.postUpdateNotification = (req, res) => {
    let authorId = req.session.userId
    
    let {title, content, amend_subject, noti_id, change} = req.body
    let files_req = req.files
    let files = []
    files_req.forEach(file => {
        if (!file.mimetype.includes("image")) {
            files.push({Type: file.mimetype, Src: "resources/notifications/" + file.filename + "&" + file.originalname})
        } else {
            files.push({Type: file.mimetype, Src: "resources/notifications/" + file.filename})
        }
    });


    if (change == 'true') {
    
        notificationModel.findOneAndUpdate({_id: noti_id}, 
        {title, content, subject: amend_subject, files, author: authorId}, 
        {new: true})
        .populate("author")
        .exec((error, noti) => {
    
            console.log(noti);
            res.json({result: "Success", noti})
        })

    } else {

        notificationModel.findOneAndUpdate({_id: noti_id}, 
        {title, content, subject: amend_subject, author: authorId}, 
        {new: true})
        .populate("author")
        .exec((error, noti) => {
    
            console.log(noti);
            res.json({result: "Success", noti})
        })
    }
}