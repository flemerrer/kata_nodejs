#!/usr/bin/env node

const express = require('express')
const app = express()

app.get('/', (request, response) => {
	response.send('Hello World!')
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

app.get('/menu', async (request, response) => {
	response.json({
		status: "ok",
		pastries: PASTRIES
	})
})

app.get('/menu/:id', async (request, response) => {
	const pastry = PASTRIES[request.params.id - 1]
	if (pastry) {
		response.json({
			status: "ok",
			pastry: pastry
		})
	} else {
		response.json({
			status: "error",
			error: "not found"
		})
	}
})

app.listen(3000, () => {
	console.log('Server started on port 3000!')
})
