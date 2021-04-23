const {check} = require('express-validator')

checker = [
    check('email')
    .exists().withMessage("Bạn cần nhập email")
    .notEmpty().withMessage("Email không được để trống")
    .isEmail().withMessage("Email không hợp lệ"),

    check('pass')
    .exists().withMessage("Bạn cần nhập password")
    .notEmpty().withMessage("Password không được để trống")
    .isLength({min: 6}).withMessage("Password phải chứa ít nhất 6 ký tự")
]

module.exports = checker