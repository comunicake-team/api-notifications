const newrelic = require('newrelic');
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const { sequelize } = require('../models');
const {
	models: { User, Message },
} = sequelize;

const auth = require('../middleware/auth');
const rateLimiter = require('../middleware/rate-limiter');
const { sendMessage } = require('./lib');

router.get('/message', auth, async (req, res, next) => {
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
		next(error);
	}
});

router.get('/user', auth, async (req, res, next) => {
	try {
		const { email } = req.userProfile;

		let user = await User.findByPk(email, {
			attributes: ['email', 'messagesRemaining'],
		});

		if (!user) {
			user = await User.create({
				email: email,
			});

			try {
				const totalUsers = await user.count();
				newrelic.recordMetric('Users/total', totalUsers);
			} catch (error) {
				next(error);
			}

			if (process.env.NEW_USER_WEBHOOK) {
				axios.post(process.env.NEW_USER_WEBHOOK, null, {
					params: {
						text: `New user ${email} has signed up!`,
					},
				});
			}
		}

		res.json(user);
	} catch (error) {
		next(error);
	}
});

router.get('/message/:publicId/send', rateLimiter, sendMessage);

router.post('/message/:publicId/send', rateLimiter, sendMessage);

router.post('/message', auth, async (req, res, next) => {
	try {
		const { phoneNumber, defaultText } = req.body;

		const createdMessage = await Message.create({
			UserEmail: req.userProfile.email,
			phoneNumber,
			defaultText,
		});

		res.status(201).json(createdMessage);
	} catch (error) {
		next(error);
	}
});

router.put('/message/:id', auth, async (req, res, next) => {
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
		next(error);
	}
});

router.put('/message/:id/change-publicId', auth, async (req, res, next) => {
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
		next(error);
	}
});

router.delete('/message/:id', auth, async (req, res, next) => {
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
		next(error);
	}
});

module.exports = router;
