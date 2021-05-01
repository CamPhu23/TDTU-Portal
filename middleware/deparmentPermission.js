module.exports = (req, res, next) => {
    if (!req.session.accountId) {
        return res.redirect('/home')
    } 
    next()
}