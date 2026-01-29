const {logger} = require("../core/logger");
const apiResponse = (status, code, message = null, data = null) => {
	const response = {
		status: status,
		code: code,
	}
	if (message) response.message = message
	if (data) response.data = data
	logger.info(JSON.stringify(response))
	return response
}

module.exports = { apiResponse }
