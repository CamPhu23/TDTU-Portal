const {check} = require('express-validator')

checker = [    
    check('department').exists().withMessage('Vui lòng nhập Tên Phòng/Khoa')
    .notEmpty().withMessage('Không được để trống Tên Phòng/Khoa'),

    check('username').exists().withMessage('Vui lòng nhập Tên tài khoản')
    .notEmpty().withMessage('Không được để trống Tên tài khoản')
    .isLength({min: 6}).withMessage('Tên tài khoản cần dài hơn 6 ký tự'),

    check('password').exists().withMessage('Vui lòng nhập Mật khẩu')
    .notEmpty().withMessage('Không được để trống Mật khẩu')
    .isLength({min: 6}).withMessage('Mật khẩu cần dài hơn 6 ký tự'),

    check('re_password').exists().withMessage('Vui lòng nhập Xác nhận mật khẩu')
    .notEmpty().withMessage('Vui lòng nhập Xác nhận mật khẩu')
    .custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error("Mật khẩu không khớp với mật khẩu xác nhận")
        }
        return true;
    }), 

    check('permissions').exists().withMessage('Vui lòng chọn Phòng/Khoa')
]

module.exports = checker