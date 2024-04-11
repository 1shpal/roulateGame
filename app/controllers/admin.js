module.exports = function (model) {
	var module = {};

	//all model loading
	const config = require('../../config/constants.js');
	module.login = require('./admin/login')(model,config);
	module.dashboard = require('./admin/dashboard')(model,config);
	module.user = require('./admin/user')(model,config);
	module.cms = require('./admin/cms')(model,config);	
	module.light_roulette = require('./admin/light-roulette')(model,config);	
	module.setting = require('./admin/setting')(model,config);
	module.banner = require('./admin/banner')(model,config);
	module.deposite = require('./admin/deposite')(model,config);
	module.withdraw = require('./admin/withdraw')(model,config);
	return module;
	
}