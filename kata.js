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

const _success = message => {
	return {
		status: "ok",
		message: message
	}
}

const _ressource = body => {
	return {
		status: "ok",
		data: body
	}
}

const _error = error => {
	return {
		status: "error",
		error: error
	}
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
		return [true, "Pastry added successfully."]
	}
}

app.get('/', async (request, response) => {
	response.send("Welcome to Dan's Bakery !")
})

app.get('/menu', async (request, response) => {
	const items = await pastry.find({}, null, null).exec()
	const cleanedItems = []
	items.forEach(p => { cleanedItems.push({id: p.id, name: p.name, price: p.price})})
	response.json(_ressource({"menu": cleanedItems}))
})

app.post('/menu', async (request, response) => {
		const name = request.body.name
		const price = request.body.price
		const items = await pastry.find({}, null, null).exec()
		const isValidPastry = checkValidity(items, name, price)
		const message = isValidPastry[1]

		if (isValidPastry[0]) {
			try {
				const item = new pastry({
					id: items.length + 1,
					name: name,
					price: price
				})
				const id = await item.save(item)
				if (id) {
					response.json(_success(message))
				}
			} catch (error) {
				response.json(_error("An error occurred."))
			}
		} else {
			response.json(_error(message))
		}
	}
)

app.get('/menu/:id', async (request, response) => {
	const item = await pastry.findOne({id: request.params.id}, null, null).exec()
	if (item) {
		const cleanedItem = {
			id: item.id,
			name: item.name,
			price: item.price
		}
		response.json(_ressource({"item": cleanedItem}))
	} else {
		response.json(_error("Item not found."))
	}
})

app.delete('/menu/:id', async (request, response) => {
	const item = await pastry.findOne({id: request.params.id}, null, null).exec()
	if (item) {
		try {
			const deleted = await pastry.deleteOne(item)
			if (deleted) {
				response.json(_success("Item deleted successfully."))
			} else {
				response.json(_error("Deletion failed."))
			}
		} catch (error) {
			response.json(_error("An error occurred."))
		}
	} else {
		response.json(_error("Item not found."))
	}
})

main().catch(err => console.log(err)).then(() => {
		app.listen(3000, () => {
			console.log('Server started on port 3000!')
		})
	}
)
