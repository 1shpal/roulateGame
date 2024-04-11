var dateFormat = require('dateformat');
var Op = Sequelize.Op;
var options = {
	key: '210asdasdasdada28734628h28dh2d28hd82378dh23h2e2d323d23d22ref4',
	secret: '210asdasdasdada28734628h28dh2d28hd82378dh23h2e2d323d23d22ref4',
	autoIpn: true
};
const Coinpayments = require("coinpayments");
const client = new Coinpayments(options);
module.exports = function (model, config) {
	var module = {};
	module.view = async function (req, res) {
		try {
			if (req.session.user.id != 0) {
				var userDetail = await model.User.findById(req.session.user.id).then(userRes => {
					return userRes;
				});
				var UserWalletdata = await model.UserWalletMaster.findAll({ where: { 'user_id': req.session.user.id }, include: [{ model: model.CurrencyMaster, as: 'currencyDetail' }] });
				if (userDetail != null) {
					req.session.depositId = "";
					res.render('frontend/deposit', {
						error: req.flash("error"),
						success: req.flash("success"),
						vErrors: req.flash("vErrors"),
						auth: req.session,
						config: config,
						title: process.env.siteName + '| Deposit',
						alias: 'deposit',
						userDetail: userDetail,
						UserWalletdata: UserWalletdata,
						setting: SettingMaster,
						getCMS: store.get("showCms")
					});
				} else {
					req.flash('error', "Please Login..");
					return res.redirect('/login');
				}
			} else {
				req.flash('error', "Please Login..");
				return res.redirect('/login');
			}
		} catch (error) {
			console.log("deposit page loading error: ", error);
			return res.redirect('/');
		}
	};

	module.checkcoin = async function (req, res) {
		try {
			var userId = req.session.user.id;
			if (userId != "" && userId != 0) {
				if (req.body.coin != "" && req.body.coin != null && req.body.coin != undefined) {
					let coinName = req.body.coin.toUpperCase();
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
						req.session.depositId = walletDetails.id
						return res.send(JSON.stringify({ status: "success", data: { walletDetails: walletDetails, currencyDetail: currencyDetail } }));
					} else {
						return res.send(JSON.stringify({ status: "fail", message: currencyType + " Deposit Wallet Detail Not Found." }));
					}

				} else {
					return res.send(JSON.stringify({ status: "fail", message: "Please Select Currency Type." }));
				}
			} else {
				return res.send(JSON.stringify({ status: "fail", message: "Please Login." }));
			}
		} catch (error) {
			console.log(error);
			return res.send(JSON.stringify({ status: "fail", message: "Something Went Wrong, Please  Refresh The Page." }));
		}
	}


	module.create = async function (req, res) {
		//console.log("create req body",req.body);
		try {
			if (req.session.user) {
				var userId = req.session.user.id;
				if (userId != "" && userId != 0) {
					var despoitCoin = req.body.amount;
					var currencyType = req.body.currency_type;
					if (despoitCoin) {
						if (despoitCoin <= 0) {
							return res.send(JSON.stringify({ status: "fail", message: "Please enter deposit amount greater than zero." }));
						}
						if (!req.session.depositId) {
							return res.send(JSON.stringify({ status: "fail", message: "Please Select Currency Type." }));
						}
						var UserWalletdata = await model.UserWalletMaster.findOne({ where: { 'user_id': userId, 'id': req.session.depositId } });
						if (UserWalletdata) {
							let userDetail = await model.User.findOne({ where: { "id": userId } });
							if (userDetail) {
								if (userDetail.is_deposit == 1) {
									if (req.session.depositId != UserWalletdata.id) {
										await userDetail.update({ "is_deposit": "0" });
										return res.send(JSON.stringify({ status: "info", message: "Administrator has blocked your diposit permission.Because of your illegal activity. Please content to your administrator" }));
									}
									let currencyDetail = CurrencyMaster.find((i) => i.id == UserWalletdata.currency_id);
									if (!currencyDetail) {
										currencyDetail = await model.CurrencyMaster.findOne({ where: { "id": UserWalletdata.currency_id } });
									}
									if (!currencyDetail) {
										return res.send(JSON.stringify({ status: "fail", message: "You selected wrong currency wallet." }));
									}

									console.log("currencyDetail.toString().toUpperCase()", currencyDetail.currency_name.toUpperCase());
									if (currencyType.toUpperCase() != currencyDetail.currency_name.toUpperCase()) {
										await userDetail.update({ "is_deposit": "0" });
										return res.send(JSON.stringify({ status: "info", message: "Administrator has blocked your diposit permission.Because of your illegal activity. Please content to your administrator" }));
									}

									currencyType = currencyDetail.currency_name;

									var buyer_email = userDetail.email_id;

									if (currencyType != "") {
										var currenyName = '';
										if (currencyType == "BTC") {
											currenyName = "btc";
										}
										if (currencyType == "ETH") {
											currenyName = "eth";
										}
										if (currencyType == "LTC") {
											currenyName = "ltc";
										}
										if (currencyType == "DOGE") {
											currenyName = "doge";
										}
										if (currencyType == "BCH") {
											currenyName = "bch";
										}
										if (currencyType == "LTCT") {
											currenyName = "LTCT";
										}

										client.createTransaction({ 'currency1': currenyName, 'currency2': currenyName, 'amount': parseFloat(despoitCoin).toFixed(8), 'buyer_email': buyer_email, ipn_url: process.env.baseUrl + "dispositeResponse" }, function (err, result) {
											// console.log("User withdraw error: ", err);
											// console.log("User withdraw result: ", result);
											if (err == null) {
												var now = new Date();
												var depostiData = {
													user_id: userId,
													currency_id: UserWalletdata.currency_id,
													coinPrice: despoitCoin,
													depositCoin: 0,
													coin_type: currenyName,
													transaction_id: result.txn_id,
													transaction_address: result.address,
													transaction_date: dateFormat(now, "yyyy-mm-dd HH:MM:ss"),
													note: "",
													wallet_id: UserWalletdata.id
												}
												model.Deposit.create(depostiData).then(depositResult => {
													res.send(JSON.stringify({ status: "success", message: currencyType + " Payment request send", data: result, currenyName: currencyType }));
												});
											} else {
												if (err.message == undefined) {
													res.send(JSON.stringify({ status: "fail", message: err }));
												} else {
													res.send(JSON.stringify({ status: "fail", message: err.message }));
												}
											}
										});
									} else {
										res.send(JSON.stringify({ status: "fail", message: "Please Select Any One Currency." }));
									}
								} else {
									return res.send(JSON.stringify({ status: "fail", message: "You Don't Allow To Deposit Amount. Please Contect Your Administrator." }));
								}
							} else {
								return res.send(JSON.stringify({ status: "fail", message: "Player detail not found. Please login." }));
							}
						} else {
							return res.send(JSON.stringify({ status: "fail", message: req.body.currency_type + " Wallet Detail Not Found." }));
						}
					} else {
						return res.send(JSON.stringify({ status: "fail", message: "Please enter deposit coins." }));
					}
				} else {
					return res.send(JSON.stringify({ status: "fail", message: "Please Login." }));
				}
			} else {
				return res.send(JSON.stringify({ status: "fail", message: "Please Login." }));
			}
		} catch (error) {
			console.log(error)
			return res.send(JSON.stringify({ status: "fail", message: "Something Went Wrong, Please  Refresh The Page." }));
		}
	}

	async function checkLimit(type, amount) {
		if (type = "BTC" || type == "btc") {
			if (parseFloat(amount) < 0.00001) {
				return { "status": false, "message": "Minimum BTC deposit amount is 0.00001" }
			}
		} else if (type = "LTC" || type == "ltc") {
			if (parseFloat(amount) < 0.0001) {
				return { "status": false, "message": "Minimum LTC deposit amount is 0.0001" }
			}
		} else if (type = "ETH" || type == "eth") {
			if (parseFloat(amount) < 0.01) {
				return { "status": false, "message": "Minimum ETH deposit amount is 0.01" }
			}
		} else if (type = "DOGE" || type == "doge") {
			if (parseFloat(amount) < 0.0001) {
				return { "status": false, "message": "Minimum DOGE deposit amount is 0.0001" }
			}
		}
		return { "status": true }
	}
	module.depistResponce = async function (req, res) {
		try {
			// console.log("IPN URL", req.body);
			if (req.body.ipn_type == "withdrawal") {
				// console.log("IPN URL", req.body);
				if (parseInt(req.body.status) < 0) {

					withdrawLogger.info(req.body);
					let withdrawDetail = await model.Withdraw.findOne({ where: { transaction_id: req.body.id } });
					if (withdrawDetail) {
						if (withdrawDetail.status == "pending") {
							withdrawDetail.update({ "status": "failed" })

							let userdetail = await model.User.findOne({
								where: { 'id': withdrawDetail.user_id },
								attributes: ["id", "name", "socketId"],
								raw: true
							});
							if (userdetail) {
								let resData = {
									"status": "error",
									"message": req.body.status_text,
									"data": {
										"userId": userdetail.id,
										"chips": ""
									}
								}
								io.to(playerDetail["plr" + userdetail.id]).emit("withdrawIPNEvent", resData);
							}
						}
					}
				} else if (parseInt(req.body.status) >= 0 && parseInt(req.body.status) <= 1) {

					withdrawLogger.info(req.body);
					let withdrawDetail = await model.Withdraw.findOne({ where: { transaction_id: req.body.id } });
					if (withdrawDetail) {
						if (withdrawDetail.status == "pending") {
							let userdetail = await model.User.findOne({
								where: { 'id': withdrawDetail.user_id },
								attributes: ["id", "name", "socketId"],
								raw: true
							});
							if (userdetail) {
								let resData = {
									"status": "pending",
									"message": req.body.status_text,
									"data": {
										"userId": userdetail.id,
										"chips": ""
									}
								}
								io.to(playerDetail["plr" + userdetail.id]).emit("withdrawIPNEvent", resData);
							}
						}
					}
				} else if (parseInt(req.body.status) >= 2) {
					withdrawLogger.info(req.body);
					let withdrawDetail = await model.Withdraw.findOne({ where: { transaction_id: req.body.id } });
					if (withdrawDetail) {
						if (withdrawDetail.status == "pending") {
							withdrawDetail.update({ "fee": parseFloat(req.body.fee).toFixed(8), "status": "success" })

							let userdetail = await model.User.findOne({
								where: { 'id': withdrawDetail.user_id },
								attributes: ["id", "name", "socketId"],
								raw: true
							});
							if (userdetail) {

								let walleteDetail = await model.UserWalletMaster.findOne({ where: { "id": withdrawDetail.wallet_id } });
								if (walleteDetail) {
									walleteDetail.increment(["main_balance"], { by: parseFloat(withdrawDetail.withdrawAmout).toFixed(8) });
									walleteDetail.decrement(["total_withdraw"], { by: parseFloat(withdrawDetail.withdrawAmout).toFixed(8) });
									walleteDetail.main_balance = parseFloat(parseFloat(walleteDetail.main_balance) + parseFloat(withdrawDetail.withdrawAmout)).toFixed(8)
								}

								let resData = {
									"status": "failed",
									"message": req.body.status_text,
									"data": {
										"userId": userdetail.id,
										"main_balance": parseFloat(walleteDetail.main_balance).toFixed(8),
										"wallet_id": walleteDetail.id
									}
								}

								io.to(playerDetail["plr" + userdetail.id]).emit("withdrawIPNEvent", resData);
							}
						}
					}
				}
			} else {
				if (parseInt(req.body.status) < 0) {
					let depositDetail = await model.Deposit.findOne({ where: { transaction_id: req.body.txn_id } });
					if (depositDetail) {
						if (depositDetail.status == "pending") {

							depositLogger.info(req.body);

							await model.Deposit.update({ "fee": parseFloat(req.body.fee).toFixed(8), "depositCoin": parseFloat(req.body.received_amount).toFixed(8), status: 'failed' }, { where: { transaction_id: req.body.txn_id, "user_id": depositDetail.user_id } });
							let userdetail = await model.User.findOne({
								where: { 'id': depositDetail.user_id },
								attributes: ["id", "name", "socketId"],
								raw: true
							});
							if (userdetail) {
								let resData = {
									"status": "error",
									"message": req.body.status_text,
									"data": {
										"userId": userdetail.id,
										"chips": ""
									}
								}
								io.to(playerDetail["plr" + userdetail.id]).emit("CoinPaymentIPNEvent", resData);
							}
						}
					}
				} else if (parseInt(req.body.status) >= 0 && parseInt(req.body.status) <= 99) {
					let depositDetail = await model.Deposit.findOne({ where: { transaction_id: req.body.txn_id } });
					if (depositDetail) {
						if (depositDetail.status == "pending") {
							let userdetail = await model.User.findOne({
								where: { 'id': depositDetail.user_id },
								attributes: ["id", "name", "socketId"],
								raw: true
							});
							if (userdetail) {
								let resData = {
									"status": "pending",
									"message": req.body.status_text,
									"data": {
										"userId": userdetail.id,
										"chips": ""
									}
								}
								io.to(playerDetail["plr" + userdetail.id]).emit("CoinPaymentIPNEvent", resData);
							}
						}
					}
				} else if (parseInt(req.body.status) >= 100) {
					// console.log("socket completed.....100", req.body.status);
					let depositDetail = await model.Deposit.findOne({ where: { transaction_id: req.body.txn_id }, raw: true });
					if (depositDetail) {
						var userId = depositDetail.user_id;
						if (depositDetail.status == 'pending') {
							let note = (req.body.note) ? req.body.note : ""
							await model.Deposit.update({ "fee": parseFloat(req.body.fee).toFixed(8), "depositCoin": parseFloat(req.body.received_amount), status: 'success', 'note': note }, { where: { transaction_id: req.body.txn_id, "user_id": depositDetail.user_id } });

							depositLogger.info(req.body);

							let userdetail = await model.User.findOne({
								where: { 'id': depositDetail.user_id },
								attributes: ["id", "name", "socketId"],
								raw: true
							});
							if (userdetail) {
								let walleteDetail = await model.UserWalletMaster.findOne({ where: { "id": depositDetail.wallet_id } });
								if (walleteDetail) {

									let currencyDetail = CurrencyMaster.find((i) => i.id == walleteDetail.currency_id);
									if (!currencyDetail) {
										currencyDetail = await model.CurrencyMaster.findOne({ where: { "id": walleteDetail.currency_id } });
									}
									let totalDepositchips = parseFloat(req.body.received_amount);//parseFloat(parseFloat(req.body.received_amount) * currencyDetail.chipsAmount).toFixed(8)

									await walleteDetail.increment(["main_balance", "total_deposite"], { by: parseFloat(totalDepositchips) });
									walleteDetail.main_balance = parseFloat(parseFloat(walleteDetail.main_balance) + parseFloat(totalDepositchips)).toFixed(8)
								}
								let resData = {
									"status": "success",
									"message": req.body.status_text,
									"data": {
										"userId": userdetail.id,
										"main_balance": parseFloat(walleteDetail.main_balance).toFixed(8),
										"wallet_id": walleteDetail.id
									}
								}
								io.to(playerDetail["plr" + userdetail.id]).emit("CoinPaymentIPNEvent", resData);
							}
						}
					}
				}
			}
		} catch (error) {
			console.log("erororr.............", error);
			depositLogger.info(error);
		}
	}

	module.getTranscationList = async function (request, response) {
		var start = parseInt(request.query.start);
		var length = parseInt(request.query.length);
		var search = request.query.search.value;
		var query = { "user_id": request.session.user.id };
		if (search != '') {
			query = {
				[Op.or]: [
					{ 'status': { [Op.like]: '%' + search + '%' } },
					{ 'depositCoin': { [Op.like]: '%' + search + '%' } },
					{ 'coin_type': { [Op.like]: '%' + search + '%' } },
					{ 'transaction_id': { [Op.like]: '%' + search + '%' } }
				], "user_id": request.session.user.id
			};
		}
		// let column = req.query.order[0].column;
		// let columns = req.query.columns[column].data;

		// let sortType = 'asc';
		// if (req.query.order[0].dir == 'desc') {
		// 	sortType = 'desc';
		// }

		var depositCount = await model.Deposit.count({ where: query });
		var depositHisList = await model.Deposit.findAll({
			where: query,
			offset: start,
			limit: length,
			order: [["id", "DESC"]],
			raw: true
		});


		var obj = {
			'draw': request.query.draw,
			'recordsTotal': depositCount,
			'recordsFiltered': depositCount,
			'perPage': length,
			'data': depositHisList
		};
		return response.send(JSON.stringify(obj));
	};
	return module;
}