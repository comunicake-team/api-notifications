'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Message extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			// define association here
			this.belongsTo(models.User);
		}
	}
	Message.init(
		{
			id: {
				allowNull: false,
				primaryKey: true,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
			},
			publicId: {
				allowNull: false,
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
			},
			phoneNumber: {
				type: DataTypes.STRING(20),
				allowNull: false,
			},
			defaultText: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Message',
		}
	);
	return Message;
};
