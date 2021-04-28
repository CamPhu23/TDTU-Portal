const io = require('../socket')
const notificationModel = require('../models/notificationModel')
const userModel = require('../models/userModel')

exports.postCreateNewNotification = (req, res) => {

    let {title, content, subject} = req.body

    let files = req.files
    let fileDic = []
    files.forEach(file => {
        fileDic.push("resources/notifications/" + file.filename)
    });

    let newNotification = new notificationModel({title, content, subject, files: fileDic, author: req.session.userId})

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

exports.getNotificationList = (req, res) => {

    let page = req.query.page
    if (page <= 0 || (isNaN(page) && isNaN(parseFloat(page)))) {
        page = 1
    }
    let skip = parseInt(page) * 10 - 10

    let pagi = {page: page}
    notificationModel.countDocuments({}, (error, count) => {
        pagi.total = (parseInt(count / 10  + 1))
    })
    let pagi_link = req.protocol + "://" + req.get('host') + '/notification?page='

    notificationModel
    .find({})
    .skip(skip)
    .limit(10)
    .sort({date: -1})
    .exec(function(err, noti) {

        let detail_href = []
        let detail_date = []
        noti.forEach(n => {
            let date = new Date(n.date).toLocaleString().split(' ')
    
            detail_date.push(date[0] + " - " + date[1])
            detail_href.push(req.protocol + "://" + req.get('host') + req.url.replace('?page=' + page, "notification/details/") + n._id)
        })

        res.render('pages/notification', {notiList: noti, link: detail_href, date: detail_date, pagi, pagi_link})
    })
}

exports.getNotificationDetails = (req, res) => {
    let notiId = req.params.id

    notificationModel.findById(notiId)
    .populate('author')
    .then((noti) => {
        let date = new Date(noti.date).toLocaleString().split(' ')

        date = date[0] + " - " + date[1]
        let delete_href = req.protocol + "://" + req.get('host') + "/notification" + req.url.replace("details", "delete")

        res.render('pages/detailsNotification', {noti, date, delete_href})
    })
    
}

exports.deleteNotification = (req, res) => {
    notificationModel.findByIdAndDelete(req.params.id, (error) => {
        if (error) return handleError(error)
    })

    res.redirect('/notification')
}

exports.getFilterNotification = (req, res) => {
    
}