var dateFormat = require('dateformat');
var Op = Sequelize.Op
var Coinpayments = require('coinpayments');
var options = {
	key: '210asdasdasdada28734628h28dh2d28hd82378dh23h2e2d323d23d22ref4',
	secret: '210asdasdasdada28734628h28dh2d28hd82378dh23h2e2d323d23d22ref4',
	autoIpn: true
};
const client = new Coinpayments(options);
module.exports = function (model, config) {
	var module = {};

	module.view = async function (req, res) {
		try {
			if (req.session.user.id != 0) {
				var userDetail = await model.User.findOne({ where: { "id": req.session.user.id } });
				if (userDetail) {
					var UserWalletdata = await model.UserWalletMaster.findAll({ where: { 'user_id': userDetail.id }, include: [{ model: model.CurrencyMaster, as: 'currencyDetail' }] });

					req.session.withdrawid = ""
					res.render('frontend/withdraw', {
						error: req.flash("error"),
						success: req.flash("success"),
						vErrors: req.flash("vErrors"),
						auth: req.session,
						config: config,
						alias: 'withdraw',
						title: process.env.siteName + " | Withdraw",
						userDetail: userDetail,
						UserWalletdata: UserWalletdata,
						setting: SettingMaster,
						getCMS: store.get("showCms")
					});
				} else {
					req.flash('error', "Please Login..");
					res.redirect('/login');
				}
			} else {
				req.flash('error', "Please Login..");
				res.redirect('/login');
			}
		} catch (error) {
			req.flash('error', "Something Went Wrong, Please  Refresh The Page.");
			res.redirect('/');
		}
	};

	module.checkcoin = async function (req, res) {
		try {
			var currencyType = req.body.currency_type;
			var userId = req.session.user.id;
			if (userId != "" && userId != 0) {
				if (currencyType != "" && currencyType != null && currencyType != undefined) {
					let coinName = currencyType.toUpperCase();

					let currencyDetail = CurrencyMaster.find((i) => i.currency_name == coinName);
					if (!currencyDetail) {
						currencyDetail = await model.CurrencyMaster.findOne({ where: { "currency_name": coinName } });
					}
					if (!currencyDetail) {
						return res.send(JSON.stringify({ status: "fail", message: "You have selected wrong currency wallet." }));
					}
					let walletDetails = await model.UserWalletMaster.findOne({
						where: { 'currency_id': currencyDetail.id, 'user_id': userId }
					});
					if (walletDetails != null) {
						req.session.withdrawid = walletDetails.id
						return res.send(JSON.stringify({
							status: "success",
							data: {
								walletDetails: walletDetails,
								currencyDetail: currencyDetail
							}
						}));
					} else {
						return res.send(JSON.stringify({ status: "fail", message: currencyType + " Withdraw Wallet Detail Not Found." }));
					}
				} else {
					return res.send(JSON.stringify({ status: "fail", message: "Please Select Currency Type." }));
				}
			} else {
				return res.send(JSON.stringify({ status: "fail", message: "Please Login." }));
			}
		} catch (error) {
			return res.send(JSON.stringify({ status: "fail", message: "Something Went Wrong, Please  Refresh The Page." }));
		}
	}
	module.create = async function (req, res) {
		try {
			if (req.session.user) {
				var userId = req.session.user.id;
				var currencyType = req.body.currency_type;
				var coin = req.body.coin;
				if (userId != "" && userId != 0) {
					if (!req.session.withdrawid) {
						return res.send(JSON.stringify({ status: "fail", message: "Please Select Currency Type." }));
					}
					var userDetail = await model.User.findOne({ where: { 'id': userId } });
					if (userDetail != null) {
						if (userDetail.is_withdraw == "1") {
							let UserWalletdata = await model.UserWalletMaster.findOne({
								where: { 'id': req.session.withdrawid, 'user_id': userId }
							});
							if (UserWalletdata) {
								let currencyDetail = CurrencyMaster.find((i) => i.id == UserWalletdata.currency_id);
								if (!currencyDetail) {
									currencyDetail = await model.CurrencyMaster.findOne({ where: { "currency_name": coinName } });
								}
								if (!currencyDetail) {
									return res.send(JSON.stringify({ status: "fail", message: "You have selected wrong currency wallet." }));
								}
								if (coin != "" && coin != 0) {

									if (req.session.withdrawid != UserWalletdata.id) {
										await userDetail.update({ "is_withdraw": "0" });
										return res.send(JSON.stringify({ status: "info", message: "Administrator has blocked your withdrawal permission.Because of your illegal activity. Please content to your administrator" }));
									}

									if (currencyType.toUpperCase() != currencyDetail.currency_name.toUpperCase()) {
										await userDetail.update({ "is_withdraw": "0" });
										return res.send(JSON.stringify({ status: "info", message: "Administrator has blocked your withdrawal permission.Because of your illegal activity. Please content to your administrator" }));
									}

									currencyType = currencyDetail.currency_name;
									if (coin <= 0) {
										return res.send(JSON.stringify({ status: "fail", message: "Please Enter Withdrawal Amount Greater than zero ." }));
									}
									if (parseFloat(UserWalletdata.main_balance) <= 0) {
										return res.send(JSON.stringify({ status: "fail", message: "Insufficient chips in your " + req.body.currency_type + " wallet." }));
									}
									if (parseFloat(coin) <= parseFloat(UserWalletdata.main_balance)) {

										var address = "";
										var currenyName = '';
										if (currencyType == "ROUL1") {
											return res.send(JSON.stringify({ status: "fail", message: "You can't withdrawal to " + req.body.currency_type + "." }));
										}
										if (currencyType == "BTC") {
											address = userDetail.btc_currency_address;
											currenyName = "btc";
										}
										if (currencyType == "ETH") {
											address = userDetail.eth_currency_address;
											currenyName = "eth";
										}
										if (currencyType == "LTC") {
											address = userDetail.ltc_currency_address;
											currenyName = "ltc";
										}
										if (currencyType == "DOGE") {
											currenyName = "doge";
											address = userDetail.doge_currency_address;
										}
										if (currencyType == "BCH") {
											currenyName = "bch";
											address = userDetail.bch_currency_address;
										}
										if (currencyType == "LTCT") {
											currenyName = "LTCT";
											address = "mkaG94v59YMP47dAhhmxkzKKWa4tUaKRvP";
										}

										var amount = coin;
										if (address) {
											let main_balance = UserWalletdata.main_balance;
											client.createWithdrawal({ 'currency': currenyName, 'amount': amount, 'address': address }, async function (err, result) {
												if (result) {

													withdrawLogger.info(result);
													var now = new Date();
													var withdrawData = {
														coinPrice: result.amount,
														withdrawAmout: result.amount,
														coin_type: currenyName,
														user_id: userId,
														currency_id: UserWalletdata.currency_id,
														transaction_id: result.id,
														status: "success",
														transaction_date: dateFormat(now, "yyyy-mm-dd HH:MM:ss"),
														wallet_id: UserWalletdata.id
													};

													let withdraw = await model.Withdraw.create(withdrawData);
													if (withdraw) {
														let currencyDetail = CurrencyMaster.find((i) => i.id == UserWalletdata.currency_id);
														if (!currencyDetail) {
															currencyDetail = await model.CurrencyMaster.findOne({ where: { "id": UserWalletdata.currency_id } });
														}
														let totalWithdrawChips = parseFloat(withdrawData.withdrawAmout); // parseFloat(parseFloat(withdrawData.withdrawAmout) * currencyDetail.chipsAmount).toFixed(8)

														main_balance = parseFloat(main_balance) - parseFloat(totalWithdrawChips);
														UserWalletdata.update({ total_withdraw: Sequelize.literal('total_withdraw + ' + totalWithdrawChips), main_balance: Sequelize.literal('main_balance - ' + totalWithdrawChips) });
														return res.send(JSON.stringify({
															"status": "success",
															"message": currenyName + " withdrawal request has been submitted successfully.",
															"data": {
																"wallet_id": UserWalletdata.id,
																"main_balance": parseFloat(main_balance).toFixed(8),
																"currency_id": UserWalletdata.currency_id,
																"user_id": userId
															}
														}));
													} else {
														return res.send(JSON.stringify({
															"status": "error",
															"message": currenyName + " withdrawal request failed.",
														}));
													}
												} else {
													withdrawLogger.info(err);
													if (err.message == undefined) {
														return res.send(JSON.stringify({ status: "fail", message: err }));
													} else {
														return res.send(JSON.stringify({ status: "fail", message: err.message }));
													}
												}
											});
										} else {
											return res.send(JSON.stringify({ status: "fail", message: "Please Fill In " + currencyType + " Currencies Withdrawal Address On Your Profile." }));
										}
									} else {
										return res.send(JSON.stringify({ status: "fail", message: "Insufficient chips in your " + req.body.currency_type + " wallet." }));
									}
								} else {
									return res.send(JSON.stringify({ status: "fail", message: "Please Enter Withdrawal Amount." }));
								}
							} else {
								return res.send(JSON.stringify({ status: "fail", message: currencyType + " Withdraw Wallet Detail Not Found." }));
							}
						} else {
							return res.send(JSON.stringify({ status: "fail", message: "You Don't Allow To Withdraw Amount. Please Contect Your Administrator." }));
						}
					} else {
						return res.send(JSON.stringify({ status: "fail", message: "Please Login." }));
					}
				} else {
					return res.send(JSON.stringify({ status: "fail", message: "Please Login." }));
				}
			} else {
				return res.send(JSON.stringify({ status: "fail", message: "Please Login." }));
			}
		} catch (error) {
			withdrawLogger.info(error);
			return res.send(JSON.stringify({ status: "fail", message: "Something Went Wrong, Please  Refresh The Page." }));
		}
	}
	async function checkLimit(type, amount) {
		if (type = "BTC" || type == "btc") {
			if (parseFloat(amount) < 0.00001) {
				return { "status": false, "message": "Minimum BTC withdraw amount is 0.00001" }
			}
		} else if (type = "LTC" || type == "ltc") {
			if (parseFloat(amount) < 0.02) {
				return { "status": false, "message": "Minimum LTC withdraw amount is 0.02" }
			}
		} else if (type = "ETH" || type == "eth") {
			if (parseFloat(amount) < 0.01) {
				return { "status": false, "message": "Minimum ETH withdraw amount is 0.01" }
			}
		} else if (type = "DOGE" || type == "doge") {
			if (parseFloat(amount) < 0.0001) {
				return { "status": false, "message": "Minimum DOGE withdraw amount is 0.0001" }
			}
		}
		return { "status": true }
	}
	module.getwithdrawlist = async function (request, response) {
		var start = parseInt(request.query.start);
		var length = parseInt(request.query.length);
		var search = request.query.search.value;
		var query = { "user_id": request.session.user.id };
		if (search != '') {
			query = {
				[Op.or]: [
					{ 'status': { [Op.like]: '%' + search + '%' } },
					{ 'withdrawAmout': { [Op.like]: '%' + search + '%' } },
					{ 'coin_type': { [Op.like]: '%' + search + '%' } },
					{ 'transaction_id': { [Op.like]: '%' + search + '%' } }
				], "user_id": request.session.user.id
			};
		}

		var withdrawCount = await model.Withdraw.count({ where: query });
		var withdrawHisList = await model.Withdraw.findAll({
			where: query,
			offset: start,
			limit: length,
			order: [["id", "DESC"]],
			raw: true
		});
		var obj = {
			'draw': request.query.draw,
			'recordsTotal': withdrawCount,
			'recordsFiltered': withdrawCount,
			'perPage': length,
			'data': withdrawHisList
		};
		return response.send(JSON.stringify(obj));
	};
	return module;
}