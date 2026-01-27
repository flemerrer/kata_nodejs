#!/usr/bin/env node

const express = require('express')
const mongoose = require('mongoose')

const jwt = require('jsonwebtoken');
const {loadEnvFile} = require('node:process');

loadEnvFile('.env');
const SECRET = process.env.SECRET

const app = express()
app.use(express.json())

const pastriesSchema = new mongoose.Schema({
	id: Number,
	name: String,
	price: Number
})
const Pastries = mongoose.model('Pastries', pastriesSchema)

const usersSchema = new mongoose.Schema({
	email: String,
	password: String
})
const Users = mongoose.model('Users', usersSchema)

async function main() {

	await mongoose.connect(process.env.DB)
}

const tokenIsValid = token => {
	return jwt.verify(token, SECRET);
}

const _response = (status, code, message = null, data = null) => {
	const response = {
		status: status,
		code: code,
	}
	if (message) response.message = message
	if (data) response.data = data
	return response
}

const itemAlreadyExists = (pastries, name) => {
	let isUnique = false
	pastries.forEach(p => {
		if (name === p.name) isUnique = true
	})
	return isUnique
}

function pastryIsValid(pastries, name, price) {
	const isUnique = itemAlreadyExists(pastries, name)

	if (!name || !price) {
		return [false, "Missing body parameters."]
	} else if (isUnique) {
		return [false, "This item already exists."]
	} else if (typeof (name) != "string" || typeof (price) != "number") {
		return [false, "Wrong parameters types."]
	} else if (price > 50) {
		return [false, "Ain't nobody gonna pay for that!"]
	} else if (name.toLowerCase() === "chocolatine") {
		return [false, "It's called 'Pain au Chocolat'!"]
	} else {
		return [true, "Item added successfully."]
	}
}

app.get('/', async (request, response) => {
	return response.json(_response("ok", 200, "Welcome to Dan's Bakery !"))
})

app.post('/auth', async (request, response) => {
	const email = request.body.email
	const password = request.body.password
	const userExists = await Users.findOne({"email": email}, null, null).exec()
	if (userExists && password === userExists.password) {
		try {
			const token = jwt.sign({email: email}, SECRET)
			return response.json(_response("ok", 200, "Authorized", {"token": token}))
		} catch (error) {
			console.log(error)
			return response.json(_response("error", 500, "An error occurred."))
		}
	} else {
		return response.json(_response("error", 401, "Bad Credentials"))
	}
})

app.get('/menu', async (request, response) => {
	const items = await Pastries.find({}, null, null).exec()
	const cleanedItems = []
	items.forEach(p => {
		cleanedItems.push({id: p.id, name: p.name, price: p.price})
	})
	return response.json(_response("ok", 200, null, {"menu": cleanedItems}))
})

app.post('/menu', async (request, response) => {
		const name = request.body.name
		const price = request.body.price
		const items = await Pastries.find({}, null, null).exec()
		const isValidPastry = pastryIsValid(items, name, price)
		const message = isValidPastry[1]

		if (!isValidPastry[0]) {
			return response.json(_response("error", 401, message))
		}
		try {
			const item = new Pastries({id: items.length + 1, name: name, price: price})
			const id = await item.save(item)
			if (id) {
				return response.json(_response("ok", 201, message))
			} else {
				return response.json(_response("error", 500, "An error occurred."))
			}
		} catch (error) {
			return response.json(_response("error", 500, "An error occurred."))
		}
	}
)

app.get('/menu/:id', async (request, response) => {
	const item = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!item) {
		return response.json(_response("error", 404, "Item not found."))
	}
	const cleanedItem = {
		id: item.id, name: item.name, price: item.price
	}
	return response.json(_response("ok", 200, null, cleanedItem))

})

app.patch('/menu/:id', async (request, response) => {
	const token = request.body ? request.body.token : null
	if (!token) {
		return response.json(_response("error", 403, "Missing JWT token."))
	}
	try {
		const isValid = tokenIsValid(token)
		if (!isValid) {
			return response.json(_response("error", 403, "Token is invalid."))
		}
	} catch (error) {
		return response.json(_response("error", 500, "An error occurred."))
	}

	const itemToUpdate = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!itemToUpdate) {
		return response.json(_response("error", 404, "Item not found."))
	}

	try {
		const newId = Math.floor(request.body.id)
		const newName = request.body.name
		const newPrice = request.body.price

		let idIsTaken
		let nameIsTaken
		if (newId !== itemToUpdate.id) {
			idIsTaken = await Pastries.findOne({id: newId}, null, null).exec()
		}
		if (newName !== itemToUpdate.name) {
			nameIsTaken = await Pastries.findOne({name: newName}, null, null).exec()
		}
		if (idIsTaken || nameIsTaken) {
			let message;
			if (nameIsTaken) message = "This name is taken."
			if (idIsTaken) message = "This id is taken."
			return response.json(_response("error", 401, message))
		}
	} catch (error) {
		console.log(error)
		return response.json(_response("error", 403, "Invalid data format."))
	}

	try {
		const updated = {}
		if (newId) updated.id = newId
		if (newName) updated.name = newName
		if (newPrice) updated.price = newPrice
		const item = await Pastries.findOneAndUpdate({
			id: request.params.id,
		}, updated, null).exec()
		if (item) {
			return response.json(_response("ok", 202, "Item updated successfully."))
		} else {
			return response.json(_response("error", 404, "Item not found."))
		}
	} catch (error) {
		return response.json(_response("error", 500, "An error occurred."))
	}

})

app.delete('/menu/:id', async (request, response) => {
	const token = request.body ? request.body.token : null
	if (!token) {
		return response.json(_response("error", 403, "Missing JWT token."))
	} else if (!tokenIsValid(token)) {
		return response.json(_response("error", 403, "Token is invalid."))
	}

	const item = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!item) {
		return response.json(_response("error", 404, "Item not found."))
	}
	try {
		const deleted = await Pastries.deleteOne(item)
		if (deleted) {
			const cleanedItem = {id: item.id, name: item.name, price: item.price}
			return response.json(_response("success", 202, `Item #${item.id} deleted successfully.`, cleanedItem))
		} else {
			return response.json(_response("error", 500, "Deletion failed."))
		}
	} catch (error) {
		return response.json(_response("error", 500, "An error occurred."))
	}
})

main().catch(err => console.log(err)).then(() => {
		app.listen(3000, () => {
			//TODO: Add real logger to log errors
			// Add custom error response for invalid json payload
			console.log('Server started on port 3000!')
		})
	}
)
