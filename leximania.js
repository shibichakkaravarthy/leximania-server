const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io").listen(server);
const port = 5000;
const moment = require("moment-timer")

const words = require('./words')
const { addUser, removeUser, getUser, getUsersInRoom, setReady, setScore, isEveryoneReady, getUserByIndex } = require('./users')
const { upsertRoom, setField, getRoom, pushAnswered, everyoneAnswered } = require('./rooms')

const router = require('./router')

app.use(router)

app.get('/test', (req, res, next) => {
	res.json('Test Successful. Server Running Good')
})

io.on('connection', (socket) => {
	let userTurn = 0;
	let userToAsk = {};
	let started = false;
	let answered = [];

	const startFresh = (room) => {
		let roomData = getRoom(room)
		userToAsk = getUserByIndex(roomData.userTurn)
		setField(room, { field: 'userToAsk', value: userToAsk })


		let userlength = getUsersInRoom().length
		let randomNumber = Math.floor(Math.random() * (words.length - 1) + 1)
		let hiddenWord = words[randomNumber - 1]
		setField(room, {field: 'hiddenWord', value: hiddenWord})


		io.to(userToAsk.id).emit('question', { word: hiddenWord })
		socket.broadcast.to(room).emit('message', { user: 'admin', text: `${userToAsk.name} will give the hint to the word` })
	}

	socket.on('disconnect', () => {
		const user = removeUser(socket.id)

		if(user) {
			io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left` })
		}
	})

	socket.on('join', ({ name, room }, callback) => {
		const data = addUser({ id: socket.id, name, room, ready: false, score: 0 })
		upsertRoom(room, socket.id)

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
			setField(room, { field: 'started', value: true })
			io.to(room).emit('message', { user: 'admin', text: 'Game Starts now' })
			startFresh(room);
		}
	})

	socket.on('start', (message) => {
		io.to(message.room).emit('time', {seconds: message.duration })
	})

	socket.on('sendMessage', (message, callback) => {
		const user = getUser(socket.id)
		const hiddenWord = getRoom(user.room).hiddenWord
		console.log('gotAnswer from user', message)
		console.log('hiddenWord', hiddenWord)
		if(message == hiddenWord) {
			io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has guessed the word correct`, type: 'success' })
			setScore(socket.id, 200)
			io.to(socket.id).emit('stopTimer')
			pushAnswered(user.room, socket.id)
			console.log('everyoneAnswered', everyoneAnswered)
			if(everyoneAnswered(user.room)) {
				let roomData = getRoom(room)
				setScore(userToAsk.id, 200)
				io.to(userToAsk.id).emit('stopTimer')
				startFresh(user.room)
			}
		}

		else {
			io.to(user.room).emit('message', { user: user.name, text: message })
		}
		callback()
	})
} )


server.listen(port, () => {
	console.log('server has started on port ', port)
})