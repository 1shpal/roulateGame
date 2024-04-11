module.exports = function (Sequelize, Schema) {
	var module = {};
	module.Cms = require('./cms')(Sequelize, Schema);
	module.Setting = require('./setting')(Sequelize, Schema);
	module.User = require('./user')(Sequelize, Schema);
	module.Chat = require('./chat')(Sequelize, Schema);
	module.CurrencyMaster = require('./currency')(Sequelize, Schema);
	module.Fireworks_master = require('./fireworks_master')(Sequelize, Schema);
	module.UserWalletMaster = require('./user_wallet')(Sequelize, Schema, module.User, module.CurrencyMaster);
	module.LightingRoulette = require('./light_roulette')(Sequelize, Schema, module.User, module.CurrencyMaster);
	module.LightingRouletteHistory = require('./light_roulette_history')(Sequelize, Schema, module.User, module.LightingRoulette, module.UserWalletMaster);

	module.Deposit = require('./deposit')(Sequelize, Schema, module.User, module.CurrencyMaster, module.UserWalletMaster);
	module.Withdraw = require('./withdraw')(Sequelize, Schema, module.User, module.CurrencyMaster, module.UserWalletMaster);

	//module.CurrencyMaster = require('./currency')(Sequelize, Schema);		
	module.WinnerLogMaster = require('./winner_log')(Sequelize, Schema, module.User, module.CurrencyMaster);
	module.BannerMaster = require('./banner_master')(Sequelize, Schema);
	module.ProvablyFair = require("./provablyfair")(Sequelize, Schema);

	return module;
}