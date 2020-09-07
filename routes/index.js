const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');

const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const checkJwt = jwt({
	// Dynamically provide a signing key
	// based on the kid in the header and
	// the signing keys provided by the JWKS endpoint.
	secret: jwksRsa.expressJwtSecret({
		cache: true,
		rateLimit: true,
		jwksRequestsPerMinute: 5,
		jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
	}),

	// Validate the audience and the issuer.
	audience: process.env.AUTH0_API_ID,
	issuer: `https://${process.env.AUTH0_DOMAIN}/`,
	algorithms: ['RS256'],
});

router.post('/:id/send-text', checkJwt, async (req, res) => {
	try {
		console.log('------------------------------------');
		console.log('Message Sent');
		console.log('------------------------------------');

		// await client.messages.create({
		//   body: "Hey Dan",
		//   from: "+12029533907",
		//   to: "+15415137352",
		// });

		res.send('Message sent');
	} catch (error) {
		console.log(error);
		res.status(500).send();
	}
});

module.exports = router;
