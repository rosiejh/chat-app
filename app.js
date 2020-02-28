const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
    console.log('A user connected.')
    socket.emit('message', 'Welcome!')

    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    })
})

server.listen(process.env.PORT || 3000, () => {
    console.log('Server has started!')
})