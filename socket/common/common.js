const Op = Sequelize.Op;

module.exports = function (model, config) {
	var module = {};
	//Start: Get Currency list data on selection
	module.selectCurrency = async function (data, callback) {
		try {
			var currencyDetails = await model.CurrencyMaster.findOne({ where: { id: data.currencyId } });
			if (currencyDetails != undefined) {
				var selectDetail = await model.UserWalletMaster.findAll({ where: { 'user_id': data.user_id } });
				await model.UserWalletMaster.update({ 'is_selected': false }, { where: { 'is_selected': true, 'user_id': data.user_id } });
				await model.UserWalletMaster.update({ 'is_selected': true }, { where: { 'id': data.wallate_id, 'user_id': data.user_id } });
				callback({ status: "success", walletData: selectDetail, currency: currencyDetails });
			} else {
				callback({ status: "error", msg: "Currency Details Not Found." });
			}
		} catch (error) {
			callback({ status: "error", msg: error });
		}
	};
	module.getSelectCurrencyData = async function (user_id, callback) {
		try {
			let UserWalletdata = await model.UserWalletMaster.findAll({ where: { 'user_id': user_id } });
			if (UserWalletdata != undefined) {
				let currencyDetails = await model.CurrencyMaster.findAll();
				callback({ status: "success", walletData: UserWalletdata, currency: currencyDetails });
			} else {
				callback({ status: "error", msg: "User Wallate Data Not Found." });
			}
		} catch (error) {
			callback({ status: "error", msg: "Something Went Wrong, Please  Refresh The Page." });
		}
	};

	module.getUpdateCurrencyDataId = async function (data, callback) {
		try {
			var UserWalletdata;
			//console.log(data);
			if (data.wallate_id == null || data.wallate_id == '') {
				UserWalletdata = await model.UserWalletMaster.findOne({ where: { 'is_selected': true, 'user_id': data.user_id } });
			} else {
				UserWalletdata = await model.UserWalletMaster.findOne({ where: { 'id': data.wallate_id, 'user_id': data.user_id } });
			}
			//console.log("UserWalletdata................",UserWalletdata)						
			if (UserWalletdata != null) {
				let currencyDetails = await model.CurrencyMaster.findOne({ where: { 'id': UserWalletdata.currency_id } });
				callback({ status: "success", walletData: UserWalletdata, currency: currencyDetails });
			} else {
				callback({ status: "error", msg: "Update User Wallate Data Not Found." });
			}
		} catch (error) {
			callback({ status: "error", msg: "Something Went Wrong, Please  Refresh The Page." });
		}
	}
	//END: Get Currency list data on selection

	module.getCurrencyData = async (callback) => {
		if (CurrencyMaster.length <= 0) {
			CurrencyMaster = await model.CurrencyMaster.findAll({ raw: true });
			return callback({ "status": "success", "message": "", "data": CurrencyMaster })
		} else {
			return callback({ "status": "success", "message": "", "data": CurrencyMaster })
		}
	}

	
	return module;
}
