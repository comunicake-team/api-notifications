'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('Messages', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
			},
			UserEmail: {
				type: Sequelize.STRING,
				references: {
					model: 'Users',
					key: 'email',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
			phoneNumber: {
				type: Sequelize.STRING(20),
				allowNull: false,
			},
			defaultText: {
				type: Sequelize.STRING(250),
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
		await queryInterface.dropTable('Messages');
	},
};
