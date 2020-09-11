const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 1000, // 1 second
	max: 1, // limit each IP to 1 requests per windowMs
});

module.exports = limiter;
