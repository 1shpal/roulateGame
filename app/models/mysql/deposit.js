module.exports = function (Sequelize, Schema, User, CurrencyMaster, UserWalletMaster) {
	var Deposite = Schema.define('deposit_master', {
		coinPrice: {
			type: Sequelize.DECIMAL(20, 8)
		},
		depositCoin: {
			type: Sequelize.DECIMAL(20, 8)
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
		transaction_address: {
			type: Sequelize.STRING
		},
		status: {
			type: Sequelize.ENUM('pending', 'success', 'failed'), defaultValue: 'pending'
		},
		note: {
			type: Sequelize.STRING,
			defaultValue: ""
		},
		is_deleted: {
			type: Sequelize.ENUM('1', '0'), defaultValue: '0'
		},
		transaction_date: {
			type: Sequelize.DATE
		}
	}, { underscored: true });

	Deposite.belongsTo(User, { as: 'userDetail', foreignKey: 'user_id' });
	Deposite.belongsTo(CurrencyMaster, { as: 'currencyDetail', foreignKey: 'currency_id' });
	Deposite.belongsTo(UserWalletMaster, { as: 'walletDetail', foreignKey: 'wallet_id' });

	Deposite.sync({ force: false });

	return Deposite;
}