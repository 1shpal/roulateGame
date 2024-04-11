module.exports = function(Sequelize, Schema, User, CurrencyMaster){
	var UserWalletMaster = Schema.define('user_wallet_master', {
	  main_balance:{
	    type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
	  },
	  total_deposite:{
	    type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
	  },
	  total_withdraw:{
	    type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
	  },
	  total_game_deposite:{
	    type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
	  },
	  total_win_amount:{
	    type: Sequelize.DECIMAL(20, 8), defaultValue: 0.00000000
	  },
	  is_selected:{
	    type: Sequelize.BOOLEAN
	  }
	}, {underscored: true});

	UserWalletMaster.belongsTo(User,{as:'userDetail',foreignKey:'user_id'});
	UserWalletMaster.belongsTo(CurrencyMaster,{as:'currencyDetail',foreignKey:'currency_id'});
	UserWalletMaster.sync({force: false});

	return UserWalletMaster;
}