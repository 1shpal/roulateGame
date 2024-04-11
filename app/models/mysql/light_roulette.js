module.exports = function (Sequelize, Schema, User, CurrencyMaster) {
	var LightingRoulette = Schema.define('light_roulette_master', {
		game_number: {
			type: Sequelize.BIGINT
		},
		game_hash: {
			type: Sequelize.STRING
		},
		hashGenerated: {
			type: Sequelize.STRING
		},
		game_hash_createDate: {
			type: Sequelize.DATE
		},
		stopped_on_number: {
			type: Sequelize.STRING,
			defaultValue: ""
		},
		bet_amount: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00
		},
		totalChipsBet: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00
		},
		admin_commission: {
			type: Sequelize.INTEGER(11),
			defaultValue: 0
		},
		admin_commission_price: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00000000
		},
		game_status: {
			type: Sequelize.ENUM('pending', 'started', 'completed'),
			defaultValue: 'pending'
		},
		isBeyond: {
			type: Sequelize.ENUM('1', '0'),
			defaultValue: '0'
		},
		isTurbo: {
			type: Sequelize.ENUM('1', '0'),
			defaultValue: '0'
		},
		winning_amount: {
			type: Sequelize.DECIMAL(20, 8)
		},
		totalWinAmountShow: {
			type: Sequelize.DECIMAL(20, 8)
		},
		game_started_on: {
			type: Sequelize.DATE
		},
		game_complete_date: {
			type: Sequelize.DATE
		},
		currencyRate: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0
		},
		is_deleted: {
			type: Sequelize.ENUM('1', '0'),
			defaultValue: '0'
		}
	}, { underscored: true });
	LightingRoulette.belongsTo(User, { as: 'playerDetails', foreignKey: 'playerId' });
	LightingRoulette.belongsTo(CurrencyMaster, { as: 'currencyDetails', foreignKey: 'currencyId' });

	LightingRoulette.sync({ force: false });
	return LightingRoulette;
}