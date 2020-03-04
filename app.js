const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users') 

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    console.log('A user connected.')

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`🙌 ${user.username} has joined!`))

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Using bad words is not allowed!👿')
        }

        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`👋 ${user.username} has left!`))
        }
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server has started!')
})