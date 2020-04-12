const users = [];

const addUser = ({ id, name, room, ready, score }) => {
	name = name.trim().toLowerCase();
	room = room.trim().toLowerCase();

	const existingUser = users.find(user => user.room === room && user.name === name)

	if(existingUser) {
		return { error: 'Username Already Exists' }
	}

	users.push({ name, room, id, ready, score })

	return { name, room, id, ready, score }
}

const getUserByIndex = (index) => {
	return users[index]
}

const setReady = (id) => {
	const index = users.findIndex(user => user.id === id)
	users[index].ready = !users[index].ready
}

const isEveryoneReady = () => {
	const isReady = users.every(user => {
		return user.ready
	})

	return isReady;
}

const setScore = (id, points) => {
	const index = users.findIndex(user => user.id === id)

	users[index].score = users[index].score + points
}

const removeUser = (id) =>{
	const index = users.findIndex(user => user.id === id);

	if(index !== -1) {
		return users.splice(index, 1)[0]
	}
}

const getUser = (id) => users.find(user => user.id === id)

const getUsersInRoom = (room) => {
	return users.filter(user => user.room === room)
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom, setReady, setScore, isEveryoneReady, getUserByIndex }