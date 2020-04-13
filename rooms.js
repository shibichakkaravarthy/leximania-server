const rooms = []

const upsertRoom = (roomName, socketId) => {
	const roomIndex = rooms.findIndex(room => roomName === room.name)

	if(roomIndex < 0) {
		let joined = []
		joined.push(socketId)
		rooms.push({ name: roomName, userTurn: 0, userToAsk: {}, started: false, hiddenWord: '', answered: [], joined })
	}

	else {
		rooms[roomIndex].joined.push(socketId)
	}
}

const resetGameData = (roomName) => {
	const index = rooms.findIndex(room => roomName === room.name )
	
	rooms[index] = { ...rooms[index], userToAsk: {}, hiddenWord: '', answered: [] }
}

const setField = (roomName, {field, value}) => {
	let roomIndex = rooms.findIndex(room => room.name === roomName)

	rooms[roomIndex][field] = value
}

const getRoom = (roomName) => {
	let room = rooms.find(room => room.name === roomName )

	return room
}

const pushAnswered = (roomName, socketId) => {
	let index = rooms.findIndex(room => room.name === roomName )

	room[index].aswered.push(socketId)
}

const everyoneAnswered = (roomName) => {
	let room = rooms.find(room => room.name === roomName)

	if(room.aswered.length === room.joined.length - 1) {
		resetGameData();
		if(room.userTurn >= room.joined.length - 1) {
			setField(room.name, {field: 'userTurn', value: 0})
		}

		else {
			setField(room.name, {field: 'userTurn', value: room.userTurn})
		}
		return true
	}

	return false

}

module.exports = { upsertRoom, setField, getRoom, pushAnswered, resetGameData, everyoneAnswered }