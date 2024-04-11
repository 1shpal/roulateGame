module.exports = function (Sequelize, Schema, User, LightingRoulette, UserWalletMaster) {
	var LightRouletteHistory = Schema.define('light_roulette_history', {
		chipsNumber: {
			type: Sequelize.STRING
		},
		bet_amount: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00
		},
		chipsBetAmount: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00
		},
		selected_color: {
			type: Sequelize.ENUM('red', 'black', 'green'),
			// defaultValue: 1
		},
		selectedNumber: {
			type: Sequelize.STRING,
			defaultValue: ""
		},
		net_winning_amout: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00
		},
		winning_amount: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00
		},
		winningAmountInCoin: {
			type: Sequelize.DECIMAL(20, 8),
			defaultValue: 0.00
		},
		is_won: {
			type: Sequelize.ENUM('yes', 'no', 'pending'),
			defaultValue: 'pending'
		},
		isSector: {
			type: Sequelize.BOOLEAN
		},
		sectorNo: {
			type: Sequelize.INTEGER(11),
			defaultValue: 0
		},
	}, { underscored: true });

	LightRouletteHistory.belongsTo(User, { as: 'userDetail', foreignKey: 'user_id' });
	LightRouletteHistory.belongsTo(User, { as: 'userRoulette', foreignKey: 'user_id' });
	LightRouletteHistory.belongsTo(LightingRoulette, { as: 'rouletteDetail', foreignKey: 'game_id' });
	LightingRoulette.hasMany(LightRouletteHistory, { as: 'rouletteHistory', foreignKey: 'game_id' });
	LightRouletteHistory.belongsTo(UserWalletMaster, { as: 'userWalleteDetail', foreignKey: 'wallete_id' });
	LightRouletteHistory.sync({ force: false });
	return LightRouletteHistory;
}