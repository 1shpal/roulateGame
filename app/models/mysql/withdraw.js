module.exports = function (Sequelize, Schema, User, CurrencyMaster, UserWalletMaster) {
	var Withdraw = Schema.define('withdraw_master', {
		coinPrice: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0
		},
		withdrawAmout: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0
		},
		fee: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0
		},
		coin_type: {
			type: Sequelize.STRING
		},
		transaction_id: {
			type: Sequelize.STRING
		},
		status: {
			type: Sequelize.ENUM('pending', 'success', 'failed'), defaultValue: 'pending'
		},
		is_deleted: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '0'
		},
		transaction_date: {
			type: Sequelize.DATE
		},
	}, { underscored: true });

	Withdraw.belongsTo(User, { as: 'userDetail', foreignKey: 'user_id' });
	Withdraw.belongsTo(CurrencyMaster, { as: 'currencyDetail', foreignKey: 'currency_id' });
	Withdraw.belongsTo(UserWalletMaster, { as: 'walletDetail', foreignKey: 'wallet_id' });

	Withdraw.sync({ force: false });

	return Withdraw;
}