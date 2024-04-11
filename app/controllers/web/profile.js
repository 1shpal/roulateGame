var Op = Sequelize.Op;
var dateformat = require('dateformat');
var currentDate = new Date();
var md5 = require('md5');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
const Coinpayments = require("coinpayments");
var options = {
	key: '210asdasdasdada28734628h28dh2d28hd82378dh23h2e2d323d23d22ref4',
	secret: '210asdasdasdada28734628h28dh2d28hd82378dh23h2e2d323d23d22ref4',
	autoIpn: true
}
const client = new Coinpayments(options);

module.exports = function (model, config) {
	var module = {};

	module.view = async function (req, res) {
		try {

			var UserWalletdata = await model.UserWalletMaster.findOne({ where: { 'user_id': req.session.user.id, 'is_selected': true } });
			var currencyDetails = '';
			if (UserWalletdata != undefined) {
				currencyDetails = await model.CurrencyMaster.findOne({ where: { 'id': UserWalletdata.currency_id } });
			}
			let wallate = {
				UserWalletdata: UserWalletdata,
				currencyDetails: currencyDetails
			};

			if (req.session.user.id) {
				var userId = req.session.user.id;

				var profileDetail = await model.User.findOne({ where: { "id": userId } }).then(profileRes => {
					return profileRes;
				});
				//	console.log("Dt: ",req.session.user);
				res.render('frontend/profile', {
					info: req.flash("info"),
					error: req.flash("error"),
					success: req.flash("success"),
					vErrors: req.flash("vErrors"),
					auth: req.session,
					config: config,
					alias: 'account',
					subAlias: 'profile',
					title: process.env.siteName + " | Profile",
					detail: profileDetail,
					wallate: wallate,
					getCMS: store.get("showCms")
				});
			} else {
				req.flash('error', "Please Login.");
				res.redirect('/');
			}
		} catch (error) {
			console.log("Error when profile page view: ", error);
			res.redirect('/');
		}
	};
	module.save = async function (req, res) {
		try {
			if (req.body != null) {
				if (req.session.user) {
					// console.log(req.body);
					var userId = req.session.user.id;
					var proName = req.body.pro_name;
					var emailId = req.body.pro_email;
					var image = req.body.pro_image;
					var anymos_check = req.body.isanymos;
					var checkstr = helper.chekStringlength(proName, 30);
					if (checkstr) {
						var userCount = await model.User.count({ where: { 'email_id': emailId, id: { [Op.ne]: userId } } });
						if (userCount == 0) {
							var userDetail = await model.User.findOne({ where: { "id": userId } }).then(userRes => {
								return userRes;
							});
							let anymosValue;
							if (anymos_check == userDetail.anymos.toString()) {
								anymosValue = userDetail.anymos;
							} else {
								anymosValue = anymos_check;
							}

							req.session.user.anymos = anymosValue;
							var updateData = { 'name': proName };
							updateData.anymos = anymosValue;

							var profileImage = "default.png";
							if (image != "") {
								updateData.profile_image = image;
								updateData.email_id = emailId;
							}
							await userDetail.update(updateData);
							req.session.user.email_id = emailId;
							req.flash('success', "Profile Save Successfully.");
							res.redirect('/profile');
						} else {
							req.flash('error', "Email-id Already Existed.");
							res.redirect('/profile');
						}
					} else {
						req.flash('error', "Pleas Enter User Name Less Than 30 Character.");
						res.redirect('/profile');
					}
				} else {
					req.flash('error', "User Detail Not Found. Please Login.");
					res.redirect('/profile');
				}
			} else {
				req.flash('error', "Profile Not Save, Please Try Again.");
				res.redirect('/profile');
			}
		} catch (error) {
			console.log("Error when profile page view: ", error);
			req.flash('error', "Profile Not Save, Please Try Again.");
			res.redirect('/profile');
		}
	};

	module.imageUpload = async function (req, res) {
		try {
			if (req.session.user) {
				var userId = req.session.user.id;
				if (userId != null && userId != 0) {
					if (req.files != null) {
						if (req.files.profile_image) {
							if (req.files.profile_image.mimetype == 'image/png' || req.files.profile_image.mimetype == 'image/jpg' || req.files.profile_image.mimetype == 'image/jpeg' || req.files.profile_image.mimetype == 'image/jpe' || req.files.profile_image.mimetype == 'image/JPEG') {
								var profile_image = req.files.profile_image;
								var tempNum = helper.randomOnlyNumber(4);
								var datetime = dateformat(currentDate, 'yyyymmddHHMMss');
								var image_name = datetime + tempNum + ".jpg";
								profile_image.mv('./public/frontend/upload/user/' + image_name, async function (uploadErr) {
									if (uploadErr == null) {
										var updateRes = await model.User.update({ 'profile_image': image_name }, { where: { 'id': userId } });
										req.flash('success', "Profile Image Change Successfully.");
										res.redirect('/profile');
									} else {
										req.flash('error', "Profile Image Not Change, Please Try Again.");
										res.redirect('/profile');
									}
								});
							} else {
								req.flash('error', "Please Enter Image File Only.");
								res.redirect('/profile');
							}
						} else {
							req.flash('error', "Image File Not Fount. Please Try Again.");
							res.redirect('/profile');
						}
					} else {
						req.flash('error', "Image File Not Fount. Please Try Again.");
						res.redirect('/profile');
					}
				} else {
					req.flash('error', "Please Login.");
					res.redirect('/');
				}
			} else {
				req.flash('error', "Please Login.");
				res.redirect('/');
			}
		} catch (error) {
			req.flash('error', "Profile Image Not Change, Please Try Again.");
			res.redirect('/profile');
		}
	};

	module.sendPasswordLink = async function (req, res) {
		try {
			if (req.session.user.id) {
				var userId = req.session.user.id;

				var userDetail = await model.User.findOne({ where: { "id": userId } });
				if (userDetail != null) {
					var emailId = userDetail.email_id;
					var passwordToken = md5(userDetail.email_id);

					await userDetail.update({ 'password_token': passwordToken });
					var transporter = nodemailer.createTransport(smtpTransport({
						host: process.env.smtphost,
						port: process.env.smtpport,
						secure: false,
						ignoreTLS: true,
						auth: {
							user: process.env.supportEmail,
							pass: process.env.password
						}
					}));

					var mailOptions = {
						from: process.env.supportEmail,
						to: emailId,
						subject: process.env.siteName + ': Change Password',
						html: '<p>Hello ' + userDetail.name + ',<br><br> You Have Change Your Password <a href="' + config.baseUrl + 'profile/change/password/' + passwordToken + '">click hear</a></p>'
					};

					var send = await transporter.sendMail(mailOptions);

					if (send) {
						req.flash('success', "Change Password Request Sent On Your Registerd Email Address.");
						res.redirect('/profile');
					} else {
						req.flash('error', "Somthing Wrong, Please Try Again.");
						res.redirect('/profile');
					}
				} else {
					req.flash('error', "Please Login.");
					res.redirect('/');
				}
			} else {
				req.flash('error', "Please Login.");
				res.redirect('/');
			}
		} catch (error) {
			console.log("Error when profile page view: ", error);
			req.flash('error', "Something Went Wrong, Please  Refresh The Page.");
			res.redirect('/');
		}
	};

	module.changePassword = async function (req, res) {
		try {
			var token = req.params.token;

			var profileDetail = await model.User.findOne({ where: { 'password_token': token } });

			if (profileDetail != null) {
				await profileDetail.update({ 'password_token': "" });
				res.render('frontend/changepassword', {
					info: req.flash("info"),
					error: req.flash("error"),
					success: req.flash("success"),
					vErrors: req.flash("vErrors"),
					auth: req.session,
					config: config,
					alias: 'account',
					subAlias: 'profile',
					title: process.env.siteName + " | Profile",
					detail: profileDetail,
					getCMS: store.get("showCms")
				});
			} else {
				req.flash('error', "Change Password Link Invalid.");
				res.redirect('/');
			}
		} catch (error) {
			console.log("Error when profile page view: ", error);
			req.flash('error', "Change Password Under Maintenance.");
			res.redirect('/');
		}
	};

	module.savePassword = async function (req, res) {
		try {
			if (req.body != null) {
				if (req.session.user) {
					var userId = req.body.user_id;
					var newPassword = req.body.new_password;
					var confirmPassword = req.body.confirm_password;
					if (newPassword == confirmPassword) {
						var userDetail = await model.User.findOne({ where: { "id": userId } });

						if (userDetail != null) {
							await userDetail.update({ 'password': md5(newPassword) });

							req.flash('success', "Password Change Successfully.");
							res.redirect('/');
						} else {
							req.flash('error', "User Detail Not Available.");
							res.redirect('/profile');
						}
					} else {
						req.flash('error', "Confirm Password Not Matched With New Password.");
						res.redirect('/profile');
					}
				} else {
					req.flash('error', "Profile Not Save, Please Try Again.");
					res.redirect('/profile');
				}
			} else {
				req.flash('error', "Profile Not Save, Please Try Again.");
				res.redirect('/profile');
			}
		} catch (error) {
			console.log("Error when profile page view: ", error);
			req.flash('error', "Profile Not Save, Please Try Again.");
			res.redirect('/profile');
		}
	};

	module.anymos = async function (req, res) {
		try {
			var userDetail = await model.User.findOne({ where: { "id": req.session.user.id } }).then(userRes => {
				return userRes;
			});

			let anymosValue;
			if (req.body.checked == 'true') {
				anymosValue = 1;
			}
			else if (req.body.checked == 'false') {
				anymosValue = 0;
			}

			await userDetail.update({ 'anymos': anymosValue });

			req.flash('success', "Anymos Mode On");
			res.redirect('/profile');


		} catch (error) {
			console.log("Error when profile page view: ", error);
			req.flash('error', "Profile Not Save, Please Try Again.");
			res.redirect('/profile');
		}
	};

	module.dgCurrancy = async function (req, res) {
		try {
			let array = [];
			await client.rates(options, function (err, result) {
				if (err == null) {
					array.push({ 'BTC': result.BTC, 'ETH': result.ETH, 'LTC': result.LTC, 'DOGE': result.DOGE, 'BCH': result.BCH })
					//console.log("arraysdrr: ", array);
					res.send(array);
				}/*else{
					console.log("Error: ", err);					
				}*/
			});
			//console.log("array: ", array);


		} catch (error) {
			//console.log("Error when profile page view: ", error);
			req.flash('error', "Profile Not Save, Please Try Again.");
			res.redirect('/profile');
		}
	};
	module.saveWalletAddress = async function (req, res) {
		try {
			var query = '';
			var coinName = '';
			if (req.body.coinName == "btc") {
				query = { 'btc_currency_address': req.body.walletAddress };
				coinName = 'BTC';
			} else if (req.body.coinName == "eth") {
				query = { 'eth_currency_address': req.body.walletAddress };
				coinName = 'ETH';
			} else if (req.body.coinName == "ltc") {
				query = { 'ltc_currency_address': req.body.walletAddress };
				coinName = 'LTC';
			} else if (req.body.coinName == "doge") {
				query = { 'doge_currency_address': req.body.walletAddress };
				coinName = 'DOGE';
			} else if (req.body.coinName == "bch") {
				query = { 'bch_currency_address': req.body.walletAddress };
				coinName = 'BCH';
			}
			if (req.body.walletAddress.length != 0) {
				var userDetail = await model.User.findOne({ where: { id: req.session.user.id } });
				if (userDetail != undefined) {
					let a = await userDetail.update(query).then(ress => {
						return res.send({ status: '200', message: coinName + " Withdrawal Address Successfully Added." });
					}).catch(err => {
						return res.send({ status: '401', message: coinName + " Withdrawal Address Failed to Added." });
					});
				} else {
					return res.send({ status: '401', message: "User Detail Not Found." });
				}
			} else {
				return res.send({ status: '401', message: "Plase Enter " + coinName + " Withdrawal Address." });
			}
		} catch (error) {
			return res.send({ status: '500', message: error });
		}
	};

	module.getProvablyFair = async (req, res) => {
		try {
			if (!req.session.user || !req.session.user.id) {
				return res.send({ "status": "error", "message": "Player id not found. Please login." });
			}
			let userId = req.session.user.id;
			let getProvably = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": userId }, order: [['id', 'DESC']] });
			if (!getProvably) {
				return res.send({ "status": "error", "message": "Your client seed detail not found" });
			}
			return res.send({ "status": "success", "message": "", "data": getProvably });

		} catch (error) {
			return res.send({
				"status": "error", "message": "Something want wrong."
			});
		}
	}

	module.changeClientSheed = async function (req, res) {
		try {
			if (!req.session.user || !req.session.user.id) {
				return res.send({ "status": "error", "message": "Player id not found. Please login." });
			}

			let userId = req.session.user.id;
			let playerDetail = await model.User.findOne({ where: { "id": userId } });
			if (!playerDetail) {
				return res.send({ "status": "error", "message": "Player detail not found." });
			}
			let gameIsRunning = await model.LightingRoulette.count({ where: { "playerId": userId, "game_status": "started" } });
			if (gameIsRunning > 0) {
				return res.send({ "status": "error", "message": "Game is running now. So You can't change your client seed." });
			}

			let getProvably = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": userId }, order: [['id', 'DESC']] });
			if (!getProvably) {
				/* Provably Fair Updates */
				let getRoundNo = await model.ProvablyFair.findOne({ where: { "status": "completed", "userId": userId }, order: [['id', 'DESC']] });
				let serverSheed = await helper.getServerSheed();
				let provably = {
					"roundNo": (getRoundNo) ? parseInt(getRoundNo.roundNo) + 1 : 1,
					"serverSheed": await helper.SHA256(serverSheed),
					"revealedServerSheed": serverSheed,
					"userId": userId
				}
				getProvably = await model.ProvablyFair.create(provably);
			}
			let sheed = req.body.clientSheed;
			let isNew = false;
			if (!playerDetail.clientSheed || playerDetail.clientSheed == "0") {
				if (!req.body.clientSheed || playerDetail.clientSheed == "0") {
					sheed = await helper.getClientSheed();
				}
				isNew = true;
			} else {
				if (getProvably.clientSheed == req.body.clientSheed || req.body.clientSheed == "") {
					sheed = await helper.getClientSheed();
				}
			}
			await getProvably.update({
				"clientSheed": sheed,
				"clientSheedUpdateTime": new Date()
			});
			await model.User.update({
				"clientSheed": sheed
			}, { where: { "id": userId } });
			req.session.user.clientSheed = sheed;
			return res.send({
				"status": "success",
				"message": "Successfully update your client seed.",
				"data": {
					"isNew": isNew,
					"serverSheed": getProvably.serverSheed,
					"revealedServerSheed": getProvably.revealedServerSheed,
					"clientSheed": sheed
				}
			});
		} catch (error) {
			console.log(error);
			return res.send({ "status": "error", "message": "Something want wrong. Please try after some time." });
		}
	}

	module.getFindFairData = async (req, res) => {
		try {
			if (!req.session.user || !req.session.user.id) {
				return res.send({ "status": "error", "message": "Player id not found. Please login." });
			}
			let userId = req.session.user.id;
			var gameMaster = "";
			var provablyFair = "";
			if (!req.query.roundNo) {
				gameMaster = await model.LightingRoulette.findOne({
					where: { "playerId": userId, "game_status": { [Op.ne]: "completed" } },
					order: [['id', 'DESC']]
				});

				provablyFair = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": userId } });
				if (!provablyFair) {
					return res.send({ "status": "error", "message": "Please update your client seed." });
				}
			} else {
				gameMaster = await model.LightingRoulette.findOne({
					where: { "playerId": userId, "game_number": req.query.roundNo },
					order: [['id', 'DESC']]
				});
				if (!gameMaster) {
					return res.send({ "status": "error", "message": "Fairness detail not found." });
				}
				if (gameMaster.game_status == "pending") {
					provablyFair = await model.ProvablyFair.findOne({ where: { "status": "active", "userId": userId } });
				} else {
					provablyFair = await model.ProvablyFair.findOne({ where: { "serverSheed": gameMaster.game_hash, "userId": userId } });
				}
			}

			let resData = {};
			if (gameMaster.game_status == "completed") {
				resData = {
					"game": {
						"game_number": gameMaster.game_number,
						"game_status": gameMaster.game_status,
						"hashGenerated": gameMaster.hashGenerated
					},
					"provablyFair": {
						"serverSheed": provablyFair.serverSheed,
						"clientSheed": provablyFair.clientSheed,
						"stopNoRoulette": provablyFair.stopNoRoulette,
						"revealedServerSheed": provablyFair.revealedServerSheed,
						"roundStartTime": provablyFair.roundStartTime,
						"numericHash": provablyFair.numericHash,
						"noramlServerSeed": provablyFair.noramlServerSeed,
						"nounce": provablyFair.nounce
					}
				}
			} else {
				resData = {
					"game": {
						"game_number": gameMaster.game_number,
						"game_status": gameMaster.game_status,
						"hashGenerated": ""
					},
					"provablyFair": {
						"serverSheed": provablyFair.serverSheed,
						"clientSheed": provablyFair.clientSheed,
						"stopNoRoulette": "",
						"revealedServerSheed": provablyFair.revealedServerSheed,
						"roundStartTime": provablyFair.roundStartTime,
						"numericHash": "",
						"noramlServerSeed": "",
						"nounce": ""
					}
				}
			}

			return res.send({
				"status": "success",
				"message": "",
				"data": resData
			});
		} catch (error) {
			console.log(error);
			return res.send({ "status": "error", "message": "Something want wrong. Please try after some time." });
		}
	}

	/*Guest */
	module.changeGuestClientSheed = async function (req, res) {
		if (!req.session.guest || !req.session.guest.id) {
			return res.send({ "status": "error", "message": "Player id not found. Please login." });
		}

		let userId = req.session.guest.id;
		let playerDetail = guestManagment[userId];
		// console.log(playerDetail);
		if (!playerDetail) {
			return res.send({ "status": "error", "message": "Player detail not found." });
		}
		let gameIsRunning = playerDetail.gameMaster;
		if (gameIsRunning.status == "started") {
			return res.send({ "status": "error", "message": "Game is running now. So You can't change your client seed." });
		}

		let getProvably = playerDetail.guestProvablyFair;
		if (Object.keys(getProvably).length <= 0) {
			let serverSheed = await helper.getServerSheed();
			playerDetail.guestProvablyFair.roundNo = (gameIsRunning.game_number) ? parseInt(gameIsRunning.game_number) : 1;
			playerDetail.guestProvablyFair.serverSheed = await helper.SHA256(serverSheed);
			playerDetail.guestProvablyFair.revealedServerSheed = serverSheed;
		}
		let sheed = req.body.clientSheed;
		let isNew = false;
		if (!playerDetail.clientSheed || playerDetail.clientSheed == "0") {
			if (!req.body.clientSheed || playerDetail.clientSheed == "0") {
				sheed = await helper.getClientSheed();
			}
			isNew = true;
		} else {
			if (getProvably.clientSheed == req.body.clientSheed || req.body.clientSheed == "") {
				sheed = await helper.getClientSheed();
			}
		}

		playerDetail.guestProvablyFair.clientSheed = sheed;
		playerDetail.guestProvablyFair.clientSheedUpdateTime = new Date();

		playerDetail.clientSheed = sheed;

		req.session.guest.clientSheed = sheed;
		return res.send({
			"status": "success",
			"message": "Successfully update your client seed.",
			"data": {
				"isNew": isNew,
				"serverSheed": playerDetail.guestProvablyFair.serverSheed,
				"revealedServerSheed": playerDetail.guestProvablyFair.revealedServerSheed,
				"clientSheed": sheed
			}
		});
	}
	module.getGuestProvablyFair = async function (req, res) {

		if (!req.session.guest || !req.session.guest.id) {
			return res.send({ "status": "error", "message": "Player id not found. Please login." });
		}

		return res.send({ "status": "success", "message": "", "data": req.session.guest.guestProvablyFair });
	}
	module.emailNotificationUpdate = async function (req, res) {
		try {
			if (!req.session.user || !req.session.user.id) {
				return res.send({ "status": "error", "message": "Player id not found. Please login." });
			}
			let isSelectEmailSend = "";
			if (req.body.status == "true") {
				isSelectEmailSend = "1";
			} else if (req.body.status == "false") {
				isSelectEmailSend = "0";
			} else {
				return res.send({ "status": "error", "message": "Something went wrong. Please try after some time." });
			}
			let playerDetail = await model.User.findOne({ where: { "id": req.session.user.id } });
			if (!playerDetail) {
				return res.send({ "status": "error", "message": "Player detail not found." });
			}
			await playerDetail.update({ "isSelectEmailSend": isSelectEmailSend });
			req.session.user.isSelectEmailSend = isSelectEmailSend;

			return res.send({
				"status": "success",
				"message": "Successfully update email of verification status.",
			});
		} catch (error) {
			console(error);
			return res.send({ "status": "error", "message": "Something went wrong. Please try after some time." });
		}
	}
	return module;
}
function isEmpty(str) {
	return (!str || 0 === str.length);
}