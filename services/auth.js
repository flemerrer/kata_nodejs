const jwt = require("jsonwebtoken")
process.loadEnvFile('.env');
const SECRET = process.env.SECRET

const generateJwtToken = email => {
	return jwt.sign({email: email}, SECRET)
}

const isValidToken = token => {
	return jwt.verify(token, SECRET);
}

module.exports = { generateJwtToken, isValidToken };
