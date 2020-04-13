const rooms = []

const upsertRoom = (roomName, socketId) => {
	const roomIndex = rooms.findIndex(room => roomName.toLowerCase() === room.name.toLowerCase())
	console.log('from upsert', roomIndex)
	if(roomIndex < 0) {
		let joined = []
		joined.push(socketId)
		rooms.push({ name: roomName.toLowerCase(), userTurn: 0, userToAsk: {}, started: false, hiddenWord: '', answered: [], joined })
	}

	else {
		rooms[roomIndex].joined.push(socketId)
	}

	console.log('after upsert', rooms)
}

const resetGameData = (roomName) => {
	const index = rooms.findIndex(room => roomName === room.name )
	
	rooms[index] = { ...rooms[index], userToAsk: {}, hiddenWord: '', answered: [] }
}

const setField = (roomName, {field, value}) => {
	let roomIndex = rooms.findIndex(room => room.name === roomName)
	console.log('from room manager', roomIndex, rooms, roomName)
	rooms[roomIndex][field] = value
}

const getRoom = (roomName) => {
	let room = rooms.find(room => room.name === roomName )

	return room
}

const pushAnswered = (roomName, socketId) => {
	let index = rooms.findIndex(room => room.name === roomName )

	rooms[index].aswered.push(socketId)
}

module.exports = { upsertRoom, setField, getRoom, pushAnswered, resetGameData }