const mongoose = require("mongoose")
const {apiResponse} = require("../services/utils.js")
const {tokenIsValid} = require("../services/auth");

const router = require('express').Router();

const pastriesSchema = new mongoose.Schema({
	id: Number,
	name: String,
	price: Number
})
const Pastries = mongoose.model('Pastries', pastriesSchema)

async function isValidNewPastry(name, price, id = null) {
	const isDuplicateName = await Pastries.findOne({name: name}, null, null).exec()
	if (!name || !price) {
		return [false, "Missing body parameters."]
	} else if (isDuplicateName) {
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

async function isDuplicate(name, id) {
	const isDuplicateId = await Pastries.findOne({id: id}, null, null).exec()
	const isDuplicateName = await Pastries.findOne({name: name}, null, null).exec()
	if (isDuplicateId) {
		return [true, "This id is already taken."]
	} else if (isDuplicateName) {
		return [true, "This name is already taken."]
	} else {
		return [false, "Item updated successfully."]
	}
}


router.get('/pastries', async (request, response) => {
	const items = await Pastries.find({}, null, null).exec()
	const cleanedItems = []
	items.forEach(p => {
		cleanedItems.push({id: p.id, name: p.name, price: p.price})
	})
	return response.json(apiResponse("ok", 200, null, {"menu": cleanedItems}))
})

router.post('/pastries', async (request, response) => {
		try {
			const name = request.body.name
			const price = request.body.price
			const isValidPastry = isValidNewPastry(name, price)
			const message = isValidPastry[1]

			if (!isValidPastry[0]) {
				return response.json(apiResponse("error", 401, message))
			}
			const item = new Pastries({id: items.length + 1, name: name, price: price})
			const id = await item.save(item)
			if (id) {
				return response.json(apiResponse("ok", 201, message))
			} else {
				return response.json(apiResponse("error", 500, "An error occurred."))
			}
		} catch (error) {
			return response.json(apiResponse("error", 500, "An error occurred."))
		}
	}
)

router.get('/pastries/:id', async (request, response) => {
	const item = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!item) {
		return response.json(apiResponse("error", 404, "Item not found."))
	}
	const cleanedItem = {
		id: item.id, name: item.name, price: item.price
	}
	return response.json(apiResponse("ok", 200, null, cleanedItem))
})

router.patch('/pastries/:id', async (request, response) => {
	const token = request.body ? request.body.token : null
	if (!token) {
		return response.json(apiResponse("error", 403, "Missing JWT token."))
	}
	if (!tokenIsValid(token)) {
		return response.json(apiResponse("error", 403, "Token is invalid."))
	}
	const itemToUpdate = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!itemToUpdate) {
		return response.json(apiResponse("error", 404, "Item not found."))
	}
	try {
		const newId = Math.floor(request.body.id)
		const newName = request.body.name
		const newPrice = request.body.price
		const isDuplicateItem = isDuplicate(newId, newName)
		const message = isDuplicateItem[1]
		if (isDuplicateItem) {
			return response.json(apiResponse("error", 401, message))
		}
		const updated = {}
		if (newId) updated.id = newId
		if (newName) updated.name = newName
		if (newPrice) updated.price = newPrice
		const item = await Pastries.findOneAndUpdate({
			id: request.params.id,
		}, updated, null).exec()
		if (item) {
			return response.json(apiResponse("ok", 202, "Item updated successfully."))
		} else {
			return response.json(apiResponse("error", 404, "Item not found."))
		}
	} catch (error) {
		console.log(error)
		return response.json(apiResponse("error", 500, "An error occurred."))
	}

})

router.delete('/pastries/:id', async (request, response) => {
	const token = request.body ? request.body.token : null
	if (!token) {
		return response.json(apiResponse("error", 403, "Missing JWT token."))
	} else if (!tokenIsValid(token)) {
		return response.json(apiResponse("error", 403, "Token is invalid."))
	}
	const item = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!item) {
		return response.json(apiResponse("error", 404, "Item not found."))
	}
	try {
		const deleted = await Pastries.deleteOne(item)
		if (deleted) {
			const cleanedItem = {id: item.id, name: item.name, price: item.price}
			return response.json(apiResponse("success", 202, `Item #${item.id} deleted successfully.`, cleanedItem))
		} else {
			return response.json(apiResponse("error", 500, "Deletion failed."))
		}
	} catch (error) {
		return response.json(apiResponse("error", 500, "An error occurred."))
	}
})

module.exports = router