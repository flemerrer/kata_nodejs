const router = require('express').Router();
const {checkJwtMiddleware} = require("../middleware/jwtMiddleware");
const service = require('../services/pastriesService');

router.get('/pastries', async (request, response) => {
	return response.json(await service.getAllPastries())
})

router.post('/pastries', async (request, response) => {
	return response.json(await service.createPastry(request))
})

router.get('/pastries/:id', async (request, response) => {
	return response.json(await service.getOnePastry(request))
})

router.patch('/pastries/:id', checkJwtMiddleware, async (request, response) => {
	return response.json(await service.updatePastry(request))
})

router.delete('/pastries/:id', checkJwtMiddleware, async (request, response) => {
	return response.json(await service.deletePastry(request))
})

module.exports = router
