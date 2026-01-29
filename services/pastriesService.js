const mongoose = require("mongoose");
const {apiResponse} = require("../services/utils.js")

const pastriesSchema = new mongoose.Schema({
	id: Number,
	name: String,
	price: Number
})
const Pastries = mongoose.model('Pastries', pastriesSchema)

async function isValidNewPastry(name, price) {
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

//FIXME: might need to make better functions as these aren't practical and a bit confusing to use (opposite logic)
async function isDuplicate(id, name) {
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

const createUpdatedItemDTO = (newId, newName, newPrice) => {
	const updated = {}
	if (newId) updated.id = newId
	if (newName) updated.name = newName
	if (newPrice) updated.price = newPrice
	return updated;
}

const getAllPastries = async () => {
	let items;
	try {
		items = await Pastries.find({}, null, null).exec()
	} catch (error) {
		return apiResponse("error", 500, "An error occurred.")
	}
	const cleanedItems = []
	items.forEach(p => {
		cleanedItems.push({id: p.id, name: p.name, price: p.price})
	})
	return apiResponse("ok", 200, null, {"menu": cleanedItems})
}

const getOnePastry = async (request) => {
	const item = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!item) {
		return apiResponse("error", 404, "Item not found.")
	}
	const cleanedItem = {
		id: item.id, name: item.name, price: item.price
	}
	return apiResponse("ok", 200, null, cleanedItem)
}

const createPastry = async (request) => {
	try {
		const name = request.body.name
		const price = request.body.price
		const id = request.body.id
		const isValidPastry = await isValidNewPastry(name, price)
		let message = isValidPastry[1]
		if (!isValidPastry[0]) {
			return apiResponse("error", 401, message)
		}
		const isDuplicateItem = await isDuplicate(id, name)
		if (isDuplicateItem[0]) {
			message = isDuplicateItem[1]
			return apiResponse("error", 401, message)
		}
		const item = new Pastries({id: id, name: name, price: price})
		const newItem = await item.save(item)
		if (newItem) {
			return apiResponse("ok", 201, message)
		} else {
			return apiResponse("error", 500, "An error occurred.")
		}
	} catch (error) {
		return apiResponse("error", 500, "An error occurred.")
	}
}

const updatePastry = async (request) => {
	let itemToUpdate
	try {
		itemToUpdate = await Pastries.findOne({id: request.params.id}, null, null).exec()
	} catch (error) {
		return apiResponse("error", 500, "An error occurred.")
	}
	if (!itemToUpdate) {
		return apiResponse("error", 404, "Item not found.")
	}
	const newName = request.body.name
	const newPrice = request.body.price
	let newId
	try {
		newId = Math.floor(parseInt(request.body.id))
	} catch (error) {
		return apiResponse("error", 403, "Item id must be an integer.")
	}
	try {
		const isDuplicateItem = await isDuplicate(newId, newName)
		const message = isDuplicateItem[1]
		if (isDuplicateItem) {
			return apiResponse("error", 401, message)
		}
		const updated = createUpdatedItemDTO(newId, newName, newPrice);
		const item = await Pastries.findOneAndUpdate({
			id: request.params.id,
		}, updated, null).exec()
		if (item) {
			return apiResponse("ok", 202, message)
		} else {
			return apiResponse("error", 404, "Item not found.")
		}
	} catch (error) {
		return apiResponse("error", 500, "An error occurred.")
	}
}

const deletePastry = async (request) => {
	const item = await Pastries.findOne({id: request.params.id}, null, null).exec()
	if (!item) {
		return apiResponse("error", 404, "Item not found.")
	}
	try {
		const deleted = await Pastries.deleteOne(item)
		if (deleted) {
			const cleanedItem = {id: item.id, name: item.name, price: item.price}
			return apiResponse("success", 202, `Item #${item.id} deleted successfully.`, cleanedItem)
		} else {
			return apiResponse("error", 500, "Deletion failed.")
		}
	} catch (error) {
		return apiResponse("error", 500, "An error occurred.")
	}
}


module.exports = {getAllPastries, getOnePastry, createPastry, updatePastry, deletePastry}
