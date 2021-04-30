const {check} = require('express-validator')

checker = [
    check('fullname').exists().withMessage('Vui lòng nhập Tên người dùng')
    .notEmpty().withMessage('Không được để trống Tên người dùng'),

    check('_class').exists().withMessage('Vui lòng nhập Lớp')
    .notEmpty().withMessage('Không được để trống Lớp'),

    check('department').exists().withMessage('Vui lòng chọn Khoa')
    .notEmpty().withMessage('Không được để trống Khoa'),
]

module.exports = checker