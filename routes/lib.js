const { sequelize } = require('../models');
const {
	models: { User, Message },
} = sequelize;

const client = require('twilio')(
	process.env.TWILIO_ACCOUNT_SID,
	process.env.TWILIO_AUTH_TOKEN
);

module.exports = { sendMessage };

async function sendMessage(req, res, next) {
	try {
		const [message] = await Message.findAll({
			where: {
				publicId: req.params.publicId,
			},
			include: [
				{
					model: User,
				},
			],
		});

		if (!message) {
			throw new Error('Message Not Found');
		}

		const user = message.User;

		if (user.messagesRemaining <= 0) {
			throw new Error('Message Limit Reached');
		}

		await client.messages.create({
			body: req.query.text || message.defaultText,
			from: process.env.TWILIO_PHONE,
			to: message.phoneNumber,
		});

		user.messagesRemaining--;
		await user.save();

		res.status(200).send('Message sent');
	} catch (error) {
		next(error);
	}
}
