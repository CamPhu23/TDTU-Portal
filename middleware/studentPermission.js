const accountModel = require('../models/accountModel')

module.exports = (req, res, next) => {
    if (!req.session.accountId) {
        next()
    } else {

        accountModel.findById(req.session.accountId)
        .then(account => {
    
            if (account.permission == "admin") { 
                return next()
            }
            return res.redirect('/home')
        })
        .catch(error => console.log(error))

    }
}