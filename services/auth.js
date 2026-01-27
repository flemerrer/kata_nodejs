const {loadEnvFile} = require("node:process")
const jwt = require("jsonwebtoken")

loadEnvFile('.env');
const SECRET = process.env.SECRET

export const generateJwtToken = email => {
	return jwt.sign({email: email}, SECRET)
}

export const tokenIsValid = token => {
	return jwt.verify(token, SECRET);
}
