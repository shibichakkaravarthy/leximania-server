const express = require('express')
const router = express.Router()

router.get('/', (re, res, next) => {
	res.json({ msg: 'server ready' })
})

module.exports = router