const {check} = require('express-validator')

checker = [
    check('password').exists().withMessage('Vui lòng nhập Mật khẩu hiện tại')
    .notEmpty().withMessage('Không được để trống Mật khẩu hiện tại')
    .isLength({min: 6}).withMessage('Mật khẩu hiện tại cần dài hơn 6 ký tự'),

    check('newpassword').exists().withMessage('Vui lòng nhập Mật khẩu mới')
    .notEmpty().withMessage('Không được để trống Mật khẩu mới')
    .isLength({min: 6}).withMessage('Mật khẩu mới cần dài hơn 6 ký tự'),

    check('re_newpassword').exists().withMessage('Vui lòng nhập Xác nhận mật khẩu mới')
    .notEmpty().withMessage('Vui lòng nhập Xác nhận mật khẩu mới')
    .custom((value, {req}) => {
        if (value !== req.body.newpassword) {
            throw new Error("Mật khẩu không khớp với mật khẩu xác nhận")
        }
        return true;
    }), 
]

module.exports = checker