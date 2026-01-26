#!/usr/bin/env node

const express = require('express')
const mongoose = require('mongoose')
const {methods} = require("express/lib/utils");
const app = express()

app.use(express.json())

const pastrySchema = new mongoose.Schema({
	id: Number,
	name: String,
	price: Number
})

const pastry = mongoose.model('pastries', pastrySchema)

async function main() {
	await mongoose.connect('mongodb://127.0.0.1:27017/pastries')
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

function checkValidity(pastries, name, price) {
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
	response.json(_response("ok", 200, "Welcome to Dan's Bakery !"))
})

app.get('/menu', async (request, response) => {
	const items = await pastry.find({}, null, null).exec()
	const cleanedItems = []
	items.forEach(p => {
		cleanedItems.push({id: p.id, name: p.name, price: p.price})
	})
	response.json(_response("ok", 200, null, {"menu": cleanedItems}))
})

app.post('/menu', async (request, response) => {
		const name = request.body.name
		const price = request.body.price
		const items = await pastry.find({}, null, null).exec()
		const isValidPastry = checkValidity(items, name, price)
		const message = isValidPastry[1]

		if (isValidPastry[0]) {
			try {
				const item = new pastry({id: items.length + 1, name: name, price: price})
				const id = await item.save(item)
				if (id) {
					response.json(_response("ok", 201, message))
				} else {
					response.json(_response("error", 500, "An error occurred."))
				}
			} catch (error) {
				response.json(_response("error", 500, "An error occurred."))
			}
		} else {
			response.json(_response("error", 401, message))
		}
	}
)

app.get('/menu/:id', async (request, response) => {
	const item = await pastry.findOne({id: request.params.id}, null, null).exec()
	if (item) {
		const cleanedItem = {
			id: item.id, name: item.name, price: item.price
		}
		response.json(_response("ok", 200, null, cleanedItem))
	} else {
		response.json(_response("error", 404, "Item not found."))
	}
})

app.patch('/menu/:id', async (request, response) => {
	const idAlreadyExists = await pastry.findOne({id: request.body.id}, null, null).exec()
	const nameAlreadyExists = await pastry.findOne({name: request.body.name}, null, null).exec()
	const updated = {
		id: request.body.id,
		name: request.body.name,
		price: request.body.price
	}
	if (!idAlreadyExists && !nameAlreadyExists) {
		try {
			const item = await pastry.findOneAndUpdate({
				id: request.params.id,
			}, updated, null).exec()
			if (item) {
				response.json(_response("ok", 202, "Item updated successfully."))
			} else {
				response.json(_response("error", 404, "Item not found."))
			}
		} catch (error) {
			response.json(_response("error", 500, "An error occurred."))
		}
	} else {
		let message;
		if (nameAlreadyExists) message = "This name is taken."
		if (idAlreadyExists) message = "This id is taken."
		response.json(_response("error", 401, message))
	}

})

app.delete('/menu/:id', async (request, response) => {
	const item = await pastry.findOne({id: request.params.id}, null, null).exec()
	if (item) {
		try {
			const deleted = await pastry.deleteOne(item)
			if (deleted) {
				const cleanedItem = {id: item.id, name: item.name, price: item.price}
				response.json(_response("success", 202, `Item #${item.id} deleted successfully.`, cleanedItem))
			} else {
				response.json(_response("error", 500, "Deletion failed."))
			}
		} catch (error) {
			response.json(_response("error", 500, "An error occurred."))
		}
	} else {
		response.json(_response("error", 404, "Item not found."))
	}
})

main().catch(err => console.log(err)).then(() => {
		app.listen(3000, () => {
			console.log('Server started on port 3000!')
		})
	}
)
