const express = require('express')
const path = require('path');
const homeRoute = require('./routes/home.js')
const authRoute = require('./routes/auth.js')
const accountRoute = require('./routes/account.js')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const cors = require('cors')
const socketio = require('./socket')
// const socketio = require('socket.io')

const app = express()
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));
app.use('/resources', express.static(path.join(__dirname, 'uploads')));
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended:false }))
app.use(session({secret: 'seesion-pass'}))
app.use(flash())

app.use('/home', homeRoute)
app.use('/auth', authRoute)
app.use('/account', accountRoute)
app.use('/resources', express.static(path.join(__dirname, 'uploads')))

let opts = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

var io = null
mongoose.connect('mongodb://127.0.0.1:27017/TDTU_Portal', opts)
    .then(() => {
        const port = 8080
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