module.exports = function(Sequelize, Schema, User, Coinflip){
	
	var BetHistory = Schema.define('bet_history', {
	  game_type:{
	    type: Sequelize.ENUM('coinflip', 'roulette','dice','blackjack')
	  },
	  bet_amount:{
	    type: Sequelize.DECIMAL(20, 8),defaultValue:0.00000000
	  }
	}, {underscored: true});

	BetHistory.belongsTo(User, { foreignKey: 'user_id', as: 'userDetail' });
	BetHistory.belongsTo(Coinflip, { foreignKey: 'game_id', as: 'gameDetail' });
	BetHistory.sync({force: false});
	return BetHistory;
}