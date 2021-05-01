const express = require('express')
const path = require('path');
const homeRoute = require('./routes/home.js')
const authRoute = require('./routes/auth.js')
const notificationRoute = require('./routes/notification')
const accountRoute = require('./routes/account.js')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const socketio = require('./socket')
const url = require('./middleware/url')
const isAuth = require('./middleware/isAuth')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended:false }))
app.use(cookieParser('cookie string'));
app.use(session({
    secret: 'seesion-pass'
}))
app.use(flash())

app.use(url)

app.get('/', (req, res) => {
    res.redirect('/home')
})

app.use('/home', isAuth, homeRoute)
app.use('/auth', authRoute)
app.use('/account', isAuth, accountRoute)
app.use('/notification', isAuth, notificationRoute)
app.use('/resources', isAuth, express.static(path.join(__dirname, 'uploads')))

app.use((req, res) => {
    res.redirect('/home')
})

let opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

var io = null
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/TDTU_Portal'
mongoose.connect(uri, opts)
.then(() => {
    const port = process.env.PORT || 8080
    const httpServer = app.listen(port, () => console.log("http://localhost:" + port))

    io = socketio.init(httpServer)

    io.on('connection', (socket) => {
        console.log('Connection success', socket.id);
        socket.on('disconnect', () => {
            console.log('Connection disconnected', socket.id);
        });
    })

})
.catch((e) => console.log("Không thể truy cập vào csdl: " + e.message))