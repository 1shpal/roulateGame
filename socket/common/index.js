const session = require('express-session');

module.exports = function (model, io, client) {
	var config = require('../../config/constants.js');
	var common = require('./common')(model, config);
	//Start Chagen Server Seed and Client
	client.on("chagneServerseed", function (data, callback) {
		common.changeServerSeed(data, function (response) {
			io.emit("getSeedData", response);
			callback(response);
		});
	});
	client.on("changeClintSeed", function (data, callback) {
		common.changeClintSeed(data, function (response) {
			io.emit("getSeedData", response);
			callback(response);
		});
	});
	//End change server seed and Client	
	//Start: Select Coin
	client.on("selectCurrency", function (data, callback) {
		common.selectCurrency(data, function (response) {
			callback(response);
		});
	});
	client.on("getSelectCurrencyData", function (user_id, callback) {
		common.getSelectCurrencyData(user_id, function (response) {
			callback(response);
		});
	});
	client.on("getUpdateCurrencyDataId", function (data, callback) {
		common.getUpdateCurrencyDataId(data, function (response) {
			//console.log(response);	
			callback(response);
		});
	});
	//End: Select Coin		

	/* Start: Currency Data Get */
	client.on("getCurrecyMasterData", (cb) => {
		common.getCurrencyData((res) => {
			return cb(res);
		})
	});
	/* End: End Get Data*/
}
