const mongoose = require("mongoose");
const router = require('express').Router();
const {apiResponse} = require("../services/utils");
const {generateJwtToken} = require("../services/auth");

const usersSchema = new mongoose.Schema({
	email: String,
	password: String
})
const Users = mongoose.model('Users', usersSchema)

router.post('/auth', async (request, response) => {
	const email = request.body.email
	const password = request.body.password
	const userExists = await Users.findOne({"email": email}, null, null).exec()
	if (userExists && password === userExists.password) {
		try {
			const token = generateJwtToken(email)
			return response.json(apiResponse("ok", 200, "Authorized", {"token": token}))
		} catch (error) {
			console.log(error)
			return response.json(apiResponse("error", 500, "An error occurred."))
		}
	} else {
		return response.json(apiResponse("error", 401, "Bad Credentials"))
	}
})

module.exports = router;