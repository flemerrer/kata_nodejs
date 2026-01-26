#!/usr/bin/env node

const express = require('express')
const app = express()

app.use(express.json());

app.get('/', (request, response) => {
	response.send("Welcome to Dan's Bakery !")
})

const PASTRIES = [
	{
		id: 1,
		name: "Pain au chocolat",
		price: 2.0
	},
	{
		id: 2,
		name: "Croissant",
		price: 1.5
	},
	{
		id: 3,
		name: "Éclair au chocolat",
		price: 2.5
	},
	{
		id: 4,
		name: "Brioche",
		price: 1.5
	},
	{
		id: 5,
		name: "Part de flan",
		price: 3.0
	},
	{
		id: 6,
		name: "Tartelette aux fraises",
		price: 3.5
	}
]

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

app.get('/menu', async (request, response) => {
	response.json(_ressource({"menu": PASTRIES}))
})

app.post('/menu', (request, response) => {
	const name = request.body.name
	const price = request.body.price

	if (name && price) {
		if ((typeof (name) == "string" && typeof(price) == "number")) {
			try {
				const newId = PASTRIES.length + 1
				PASTRIES.push({
					id: newId,
					name: name,
					price: price
				})
				if (newId === PASTRIES.length) {
					response.json(_success("Pastry added successfully."))
				}
			} catch (error) {
				response.json(_error("An error occurred."))
			}
		} else {
			response.json(_error("Wrong parameters types."))
		}

	} else {
		response.json(_error("Missing body parameters."))
	}
})

app.get('/menu/:id', async (request, response) => {
	const pastry = PASTRIES[request.params.id - 1]
	if (pastry) {
		response.json(_ressource({"item": pastry}))
	} else {
		response.json(_error("Item not found."))
	}
})

app.delete('/menu/:id', async (request, response) => {
	const pastry = PASTRIES[request.params.id - 1]
	if (pastry) {
		try {
		PASTRIES.splice(pastry.id-1, 1)
		PASTRIES.forEach(p => {
			if (p.id > request.params.id) p.id--
		})
		response.json(_success("Item removed successfully."))
		} catch (error) {
			response.json(_error("An error occurred."))
		}
	} else {
		response.json(_error("Item not found."))
	}
})


app.listen(3000, () => {
	console.log('Server started on port 3000!')
})
