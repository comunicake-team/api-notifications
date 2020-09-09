const express = require('express');
const router = express.Router();
const { sequelize } = require('../models');
const {
	models: { User, Message },
} = sequelize;

const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const auth = require('../middleware/auth');

router.delete('/message/:id', auth, async (req, res) => {
	try {
		const id = req.params.id;

		const message = await Message.findByPk(id, {
			where: { UserEmail: req.userProfile.email },
		});

		if (message) {
			await message.destroy();
		} else {
			throw new Error('Message Not Found');
		}
		res.status(200).send('Message Deleted');
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.post('/message/:id/send', async (req, res) => {
	try {
		const id = req.params.id;
		const message = await Message.findByPk(id);

		if (message) {
			console.log(
				`Message "${req.body.message || message.defaultText}" sent to ${
					message.phoneNumber
				}`
			);
			// await client.messages.create({
			//   body: "Hey Dan",
			//   from: "+12029533907",
			//   to: "+15415137352",
			// });
			res.send('Message sent');
		} else {
			throw new Error('Message Not Found');
		}
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.post('/message', auth, async (req, res) => {
	try {
		const { email: userEmail } = req.userProfile;
		const { phoneNumber, defaultText } = req.body;

		const createdMessage = await Message.create({
			UserEmail: userEmail,
			phoneNumber,
			defaultText,
		});

		res.status(201).json(createdMessage);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.get('/message', auth, async (req, res) => {
	try {
		const messages = await Message.findAll({
			where: {
				UserEmail: req.userProfile.email,
			},
		});

		res.json(messages);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

module.exports = router;
