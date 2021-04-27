const express = require('express')
const path = require('path');
const homeRoute = require('./routes/home.js')
const authRoute = require('./routes/auth.js')
const mongoose = require('mongoose')
const session = require('express-session')

const app = express()
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({ extended:false }))
app.use(session({secret: 'seesion-pass'}))

app.use(homeRoute)
app.use('/auth', authRoute)

let opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.connect('mongodb://127.0.0.1:27017/TDTU_Portal', opts)
.then(() => {
    const port = 8080
    app.listen(port, () => console.log("http://localhost:" + port))
})
.catch((e) => console.log("Không thể truy cập vào csdl: " + e.message))