const jwt = require('express-jwt');
const jwtAuthz = require('express-jwt-authz');
const jwksRsa = require('jwks-rsa');
const AuthenticationClient = require('auth0').AuthenticationClient;
const auth0 = new AuthenticationClient({
	domain: process.env.AUTH0_DOMAIN,
	clientId: process.env.AUTH0_API_ID,
});

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

async function getUserProfile(req, res, next) {
	const accessToken = req.headers.authorization.split(' ')[1]; // should be present & safe because auth0 middleware already validated auth token.

	// https://auth0.github.io/node-auth0/module-auth.AuthenticationClient.html#getProfile
	req.userProfile = await auth0.getProfile(accessToken);

	next();
}

const auth = [checkJwt, getUserProfile];

module.exports = auth;
