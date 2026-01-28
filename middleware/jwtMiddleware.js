const {apiResponse} = require("../services/utils")
const {isValidToken} = require("../services/auth")

function checkJwtMiddleware(request, response, next) {
	try {
		const token = request.headers.authorization ? request.headers.authorization.replace("Bearer ", "") : null
		if (!token) {
			return response.json(apiResponse("error", 403, "Missing JWT token."))
		}
		if (!isValidToken(token)) {
			return response.json(apiResponse("error", 403, "Token is invalid."))
		}
	} catch (error) {
		return response.json(apiResponse("error", 500, "An error occurred."))
	}
	return next()
}

module.exports = {checkJwtMiddleware}
