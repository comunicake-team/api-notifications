'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.hasMany(models.Message);
		}
	}
	User.init(
		{
			email: {
				type: DataTypes.STRING,
				primaryKey: true,
			},
			messagesRemaining: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 100,
			},
		},
		{
			sequelize,
			modelName: 'User',
		}
	);
	return User;
};
