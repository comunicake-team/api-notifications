const express = require('express');
const router = express.Router();

const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const auth = require('../middleware/auth');

router.post('/:id/send-text', auth, async (req, res) => {
	try {
		console.log('------------------------------------');
		console.log(req.userProfile);
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
