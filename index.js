const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 5000;

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')

const router = require('./router')

app.use(router)

io.on('connection', (socket) => {
	console.log('We have a connection')

	socket.on('disconnect', () => {
		console.log(' a user is disconnected ')
		const user = removeUser(socket.id)

		if(user) {
			io.to(user.room).emit('message', { user: 'admin', text: 'You abandoned the game' })
			socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` })
		}
	})

	socket.on('join', ({ name, room }, callback) => {
		const data = addUser({ id: socket.id, name, room })
		console.log('data', data)
		if(data.error) {
			return callback(data)
		}

		socket.emit('message', { user: 'admin', text: `Hello ${data.name}, Welcome to Word Builder! ` })
		socket.broadcast.to(data.room).emit('message', { user: 'admin', text: `${data.name} has joined the Game` })

		socket.join(data.room)

		callback();
	})

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id)
		console.log('gotMessage', user)
		io.to(user.room).emit('message', { user: user.name, text: message })

		callback()
	})
} )


server.listen(port, () => {
	console.log('server has started on port ', port)
})