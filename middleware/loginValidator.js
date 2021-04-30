const {check} = require('express-validator')

checker = [
    check('username')
    .exists().withMessage("Bạn cần nhập Tên tài khoản")
    .notEmpty().withMessage("Tên tài khoản không được để trống")
    .isLength({min: 6}).withMessage('Tên tài khoản cần dài hơn 6 ký tự'),

    check('pass')
    .exists().withMessage("Bạn cần nhập password")
    .notEmpty().withMessage("Password không được để trống")
    .isLength({min: 6}).withMessage("Password phải chứa ít nhất 6 ký tự")
]

module.exports = checker