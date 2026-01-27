#!/usr/bin/env node

const express = require('express')
const mongoose = require('mongoose')
const usersRouter = require('./routes/usersRouter');
const pastriesRouter = require('./routes/pastriesRouter');
const {apiResponse} = require("./services/utils");
const app = express()

app.use(express.json())
app.use(usersRouter)
app.use(pastriesRouter)

main().catch(err => console.log(err)).then(() => {
		app.listen(3000, () => {
			//TODO: Add real logger to log errors
			//TODO: Add custom error response for invalid json payload
			console.log('Server started on port 3000!')
		})
	}
)

app.get('/', async (request, response) => {
	return response.json(apiResponse("ok", 200, "Welcome to Francis' Bakery !"))
})

async function main() {
	await mongoose.connect(process.env.DB)
}
