module.exports = function (model) {
	var module = {};

	const config = require('../../config/constants.js');

	module.auth = require('./web/auth')(model,config);
	module.home = require('./web/home')(model,config);	
	module.lighting_roulette = require('./web/lighting_roulette')(model,config);
	module.profile = require('./web/profile')(model,config);
	module.cmsPage = require('./web/cmsPage')(model,config);
	module.withdraw = require('./web/withdraw')(model,config);	
	module.deposit = require('./web/deposit')(model,config);
	module.withdraw = require('./web/withdraw')(model,config);
	return module;
}
