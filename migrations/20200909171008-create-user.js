'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('Users', {
			email: {
				type: Sequelize.STRING,
				primaryKey: true,
				validate: {
					isEmail: true,
				},
			},
			messagesRemaining: {
				type: Sequelize.INTEGER,
				allowNull: false,
				defaultValue: 100,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('Users');
	},
};
