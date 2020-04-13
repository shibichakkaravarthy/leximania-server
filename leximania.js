const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 5000;
const moment = require("moment-timer")

const words = require('./words')
const { addUser, removeUser, getUser, getUsersInRoom, setReady, setScore, isEveryoneReady, getUserByIndex } = require('./users')

const router = require('./router')

app.use(router)

app.get('/test', (req, res, next) => {
	res.json('Test Successful. Server Running Good')
})

io.on('connection', (socket) => {
	console.log('We have a connection')
	console.log()

	let userTurn = 0;
	let userToAsk = {};
	let started = false;
	let hiddenWord = '';
	let answered = [];

	const startFresh = (room) => {
		userToAsk = getUserByIndex(userTurn)

		let userlength = getUsersInRoom().length
		let randomNumber = Math.floor(Math.random() * (words.length - 1) + 1)
		hiddenWord = words[randomNumber - 1]


		io.to(userToAsk.id).emit('question', { word: hiddenWord })
		socket.broadcast.to(room).emit('message', { user: 'admin', text: `${userToAsk.name} will give the hint to the word` })
	}

	socket.on('disconnect', () => {
		console.log(' a user is disconnected ')
		const user = removeUser(socket.id)

		if(user) {
			io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` })
		}
	})

	socket.on('join', ({ name, room }, callback) => {
		const data = addUser({ id: socket.id, name, room, ready: false, score: 0 })
		if(data.error) {
			return callback(data)
		}

		socket.emit('message', { user: 'admin', text: `Hello ${data.name}, Welcome to Word Builder! The game will start once everyone is Ready ` })
		socket.broadcast.to(data.room).emit('message', { user: 'admin', text: `${data.name} has joined the Game` })

		socket.join(data.room)

		io.to(data.room).emit('users', { room: data.room, users: getUsersInRoom(data.room) } )

		callback();
	})

	socket.on('ready', ({room}, callback) => {
		setReady(socket.id)
		let test = isEveryoneReady()
		if(test) {
			io.to(room).emit('message', { user: 'admin', text: 'Game Starts now' })

			startFresh(room);
		}
	})

	socket.on('start', (message) => {
		console.log('started timer', message.duration, message.room)
		io.to(message.room).emit('time', {seconds: message.duration })
	})

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id)
		console.log('gotAnswer', message, hidden word)
		if(message == hiddenWord) {
			io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has guessed the word correct`, type: 'success' })
			setScore(socket.id, 200)
			answered.push(socket.id)

			if(answered.length == getUsersInRoom(user.room).length - 1) {
				userTurn = 0;
				userToAsk = {};
				started = false;
				hiddenWord = '';
				answered = [];
				startFresh(user.room);
			}
		}

		else {
			io.to(user.room).emit('message', { user: user.name, text: message })
		}
		io.to(user.room).emit('users', { room: user.room, users: getUsersInRoom(user.room) })

		callback()
	})
} )


server.listen(port, () => {
	console.log('server has started on port ', port)
})