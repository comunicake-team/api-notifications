const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models');
const {
	models: { User, Message },
} = sequelize;

const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rate-limiter');

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
		res.status(200).json(message);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.get('/message/:publicId/send', rateLimiter, async (req, res) => {
	try {
		const [message] = await Message.findAll({
			where: {
				publicId: req.params.publicId,
			},
		});

		if (message) {
			console.log(
				`Message "${req.query.text || message.defaultText}" sent to ${
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
		const { phoneNumber, defaultText } = req.body;

		const createdMessage = await Message.create({
			UserEmail: req.userProfile.email,
			phoneNumber,
			defaultText,
		});

		res.status(201).json(createdMessage);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.put('/message/:id', auth, async (req, res) => {
	try {
		const { phoneNumber, defaultText } = req.body;
		const [_, updatedMessage] = await Message.update(
			{
				phoneNumber,
				defaultText,
			},
			{
				where: {
					id: req.params.id,
					UserEmail: req.userProfile.email,
				},
				returning: true,
				plain: true,
			}
		);

		res.status(200).json(updatedMessage);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.put('/message/:id/change-publicId', auth, async (req, res) => {
	try {
		const [_, updatedMessage] = await Message.update(
			{
				publicId: uuidv4(),
			},
			{
				where: {
					id: req.params.id,
					UserEmail: req.userProfile.email,
				},
				returning: true,
				plain: true,
			}
		);

		res.status(200).json(updatedMessage);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

router.get('/message', auth, async (req, res) => {
	try {
		const messages = await Message.findAll({
			attributes: ['id', 'publicId', 'phoneNumber', 'defaultText'],
			where: {
				UserEmail: req.userProfile.email,
			},
			order: [['createdAt', 'DESC']],
		});

		res.json(messages);
	} catch (error) {
		console.log(error);
		res.status(500).send(error.message);
	}
});

module.exports = router;
