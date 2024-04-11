var Op = Sequelize.Op;
var md5 = require('md5');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
module.exports = function (model, config) {
	var module = {};

	module.register = async function (req, res) {
		try {
			console.log('process.env -->', process.env.database.host);
			if (req.headers['x-forwarded-for']) {
				console.log('ipAddress -->', req.headers['x-forwarded-for'].split(/, /)[0]);
			}

			var device = ''

			var str = req.headers['user-agent'];
			var string = str.indexOf("Android")
			console.log('string -->', string);
			var string2 = str.indexOf("iPhone")
			console.log('string2 -->', string2);
			if (string == -1 && string2 == -1) {
				console.log('Desktop');
				device = 'Desktop'
			} else {
				console.log('Mobile');
				device = 'Mobile'
			}
			console.log('--------------------');
			console.log('Decive - ', device);
			console.log('--------------------');

			
			var emailId = req.body.email_id;
			var userCount = await model.User.count({ where: { 'email_id': emailId, "is_deleted": "0" } }).then(userData => {
				return userData;
			});
			var chekName = isAlphaNumeric(req.body.full_name);
			if (chekName == false) {
				req.flash('error', "Please Input Alphanumeric Characters only.");
				res.redirect('/');
			}
			var checkstr = helper.chekStringlength(req.body.full_name, 30);
			if (checkstr == false) {
				req.flash('error', "Please Enter User Name 30 Characters only.");
				res.redirect('/');
			}

			if (userCount > 0) {
				req.flash('error', "Email-id Already Exist.");
				res.redirect('/');
			} else {

				var fullName = req.body.full_name;
				var password = md5(req.body.password);
				var confirmPassword = md5(req.body.confirm_password);

				if (password == confirmPassword) {
					var registerData = {
						name: fullName,
						email_id: emailId,
						password: password,
						user_can_chat: '1',
						is_login: '1',
						lastLogin: new Date(),
						status: '1',
						isSelectEmailSend: "1",
						ipAddress : req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(/, /)[0] : null,
						device : device
					}
					var userDetail = await model.User.create(registerData).then(registerRes => {
						return registerRes;
					});
					/* Provably Fair Updates */
					let serverSheed = await helper.getServerSheed();
					let provably = {
						"roundNo": 1,
						"noramlServerSeed": serverSheed,
						"serverSheed": await helper.SHA256(serverSheed),
						"userId": userDetail.id
					}
					await model.ProvablyFair.create(provably);

					//Start: User wallate create currency wise:
					var currencyDetails = await model.CurrencyMaster.findAll();
					// console.log("currencyDetails",currencyDetails);
					if (currencyDetails.length > 0) {
						let userWallate = [];
						for (let ii = 0; ii < currencyDetails.length; ii++) {
							let is_selected = false;
							if (currencyDetails[ii].id == 5) {
								is_selected = true;
							}
							let wallate = {
								main_balance: 0.00000000,
								total_deposite: 0.00000000,
								total_withdraw: 0.00000000,
								total_game_deposite: 0.00000000,
								total_win_amount: 0.00000000,
								is_selected: is_selected,
								user_id: userDetail.id,
								currency_id: currencyDetails[ii].id
							};
							if (currencyDetails[ii].id == 5) {
								wallate.main_balance = SettingMaster.bonusChips
							}

							userWallate.push(wallate);
						}
						let createWallate = await model.UserWalletMaster.bulkCreate(userWallate).then(wallateData => {
							return wallateData;
						}).catch(error => {
							req.flash('error', "Wallate Creation Failed.");
							res.redirect('/');
						});
					}
					//End: User wallate create currency wise:
					if (userDetail != null) {
						delete req.session.guest;
						delete req.session.guestWallate;
						req.session.user = userDetail;
						req.flash('success', "Register Successfully.");
						res.redirect('/');
					} else {
						req.flash('error', "Something Wan't Wrong, Please Try Again.");
						res.redirect('/');
					}
				} else {
					req.flash('error', "Please Enter The Same Password As Above.");
					res.redirect('/');
				}
			}
		} catch (error) {
			console.log("Error when user register data save: ", error);
			req.flash('error', "Something Wan't Wrong, Please Try Again.");
			res.redirect('/');
		}
	};

	module.login = async function (req, res) {
		try {
			var emailId = req.body.login_email_id;
			var password = req.body.login_password;
			var userData = await model.User.findOne({ where: { 'email_id': emailId, 'password': md5(password), 'is_deleted': '0', "type": "user" } }).then(data => {
				return data;
			});

			if (userData == null) {
				req.flash('error', "Email-id or Password Was Wrong.");
				return res.redirect('/');
			} else {
				if (userData.is_login == '0') {
					req.flash('error', "Your Account Is Block, Please Contact To Administrator.");
					return res.redirect('/');
				} else {
					if (playerDetail["plr" + userData.id]) {
						if (playerDetail["plr" + userData.id].isOnline && (!playerDetail["plr" + userData.id].isGame)) {
							io.in(playerDetail["plr" + userData.id].socketId).emit("ForceLogout", {
								"status": "success", "message": "You have forcefully logout because of login with another device."
							});
						}
						// else if (playerDetail["plr" + userData.id].isOnline && playerDetail["plr" + userData.id].isGame) {
						// 	req.flash('error', "You can't login because of you have login with another device & game is ongoing so please wait.");
						// 	return res.redirect('/');
						// }
					}

					var UserWalletdata = await model.UserWalletMaster.findOne({ where: { 'user_id': userData.id, 'is_selected': true } });
					var currencyDetails = '';
					if (UserWalletdata != undefined) {
						currencyDetails = await model.CurrencyMaster.findOne({ where: { 'id': UserWalletdata.currency_id } });
					}
					let wallate = {
						UserWalletdata: UserWalletdata,
						currencyDetails: currencyDetails
					};
					req.session.user = userData;
					req.session.wallate = wallate;
					delete req.session.guest;
					delete req.session.guestWallate;
					if (req.body.remember) {
						res.cookie('auth_login_detail', { 'emailId': emailId, 'password': password });
					} else {
						res.clearCookie('login_detail');
					}

					await userData.update({ "lastLogin": new Date() });

					req.flash('success', "Login Successfully.");
					return res.redirect('/');
				}
			}
		} catch (error) {
			console.log("Error when user login data check: ", error);
			req.flash('error', "Something Wan't Wrong, Please Try Again.");
			return res.redirect('/');
		}
	};

	module.fourceTologout = async function (req, res) {
		delete req.session.user;
		delete req.session.wallate;
		res.cookie("auth_login_detail", {});
		req.flash('info', "You have forcefully logout because of login with another device.");
		return res.redirect('/');
	};

	module.forget = function (request, response) {
		response.render('frontend/forget', {
			info: request.flash("info"),
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			session: request.session,
			title: process.env.siteName + ' | Forgot Password',
			config: config,
			getCMS: store.get("showCms")

		});
	};

	module.forgetPassword = async function (request, response) {
		var emailId = request.body.email;
		try {
			if (emailId != "" && emailId != null) {
				var userDetail = await model.User.findOne({ where: { 'email_id': emailId } });
				if (userDetail != null) {
					var newPassword = generatePassword(8);
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

					let forgot_id = cryptr.encrypt(userDetail.id);
					var mailOptions = {
						from: process.env.supportEmail,
						to: emailId,
						subject: process.env.siteName + ': Forgot Password',
						//	html: '<p>Hello ' + userDetail.name + ',<br><br>Your new password is: <b>'+newPassword+' </b></p>'
						html: 'Hello ' + userDetail.name + ', <br><br>  Click here to set new password : <a href="' + config.baseUrl + 'newpassword/' + forgot_id + '">Click here</a>'
					};
					var send = await transporter.sendMail(mailOptions);
					if (send) {
						var userUpdate = await userDetail.update({ 'forgot_password_token': forgot_id });
						request.flash('success', "Mail Sent On Your Registered Email Address");
						return response.redirect('/forget');
					} else {
						request.flash('error', "Somthing Wrong, Please Try Again.");
						return response.redirect('/forget');
					}
				} else {
					request.flash('error', "Email-id Is Wrong.");
					return response.redirect('/forget');
				}
			} else {
				request.flash('error', "Please Enter Email-id.");
				return response.redirect('/forget');
			}
		} catch (err) {
			console.log("forgot password: ", err);
			request.flash('error', "Email-id Is Wrong.");
			return response.redirect('/forget');
		}
	};

	module.newPassword = async function (request, response) {

		try {
			const decryptedString = cryptr.decrypt(request.params.id);
			let userDetail = await model.User.findOne({ where: { 'id': decryptedString }, raw: true });
			//console.log("newPassword  newPassword: ",userDetail);
			if (userDetail) {
				if (userDetail.forgot_password_token == request.params.id) {
					return response.render('frontend/newPassword', {
						info: request.flash("info"),
						error: request.flash("error"),
						success: request.flash("success"),
						vErrors: request.flash("vErrors"),
						session: request.session,
						config: config,
						user: userDetail,
						token: request.params.id,
						title: process.env.siteName + ' | Reset Password',
						getCMS: store.get("showCms")
					});
				} else {
					request.flash('error', "Please forgot again token has expire");
					return response.redirect('/');
				}

			} else {
				request.flash('error', "Detail not found please forgot again");
				return response.redirect('/');
			}
		} catch (error) {
			request.flash('error', "Worng's token please forgot again");
			return response.redirect('/');
		}
	}

	module.updateNewpassword = async function (request, response) {
		try {
			let token = request.body.token;
			let pass = request.body.password;
			let c_pass = request.body.c_password;
			if (pass != c_pass) {
				return response.redirect('/');
			}

			let decryptedString = cryptr.decrypt(token);
			let userDetail = await model.User.findOne({ where: { 'id': decryptedString }, raw: true });
			if (userDetail) {
				let user = await model.User.update({ password: md5(pass), forgot_password_token: '' }, { where: { id: userDetail.id } });
				if (userDetail) {
					request.flash('success', "New password update .");
					return response.redirect('/');
				}
				request.flash('error', "fail due to some reason");
				return response.redirect('/');

			} else {
				request.flash('error', "Worng's token please forgot again");
				return response.redirect('/');
			}

		} catch (error) {
			console.log(" updateNewpassword : ", error)
			request.flash('error', "Worng's token please forgot again");
			return response.redirect('/');
		}
	}

	module.logout = async function (req, res) {
		console.log('req.session -->',req.session);
		if(req.session.guest){
			console.log('guest logout and minus 1 guestCount');
			guestCount --;
		}
		delete req.session.user;
		delete req.session.wallate;
		delete req.session.guest;
		delete req.session.guestWallate;
		
		req.flash('success', "Logout Successfully.");
		return res.redirect('/');
	};


	/* Guest Player */
	module.guestLogin = async function (req, res) {
		// console.log('req.session--->', req.session);	
		if (req.session.user) {
			delete req.session.user;
			delete req.session.wallate;
			delete req.session.guest;
			delete req.session.guestWallate;
			res.cookie("auth_login_detail", {});
			req.flash('info', "You have forcefully logout because of login with guest account.");
			return res.redirect('/');
		}

		var guestdata = req.session.guest;
		
		if (!req.session.guest) {
			guestdata = await getPlayerSave();
		} else {
			if (!req.session.guest.id) {
				guestdata = await getPlayerSave();
			}
		}

		req.session.guest = guestdata;

		guestCount ++

		req.flash('success', "Logged in successfully as guest player");
		return res.redirect('/');
	}

	async function getPlayerSave() {
		let guestId = new Date().getTime();
		let wallate = {
			id: 112221111,
			main_balance: parseFloat(10000).toFixed(4),
			is_selected: 1,
			user_id: guestId,
			currency_id: 5,
			currency_name: "ROUL1",
			currency_image: "select-chip.png"
		};
		let serverSheed = await helper.getServerSheed();
		let provably = {
			"roundNo": 1,
			"clientSheed": "",
			"noramlServerSeed": serverSheed,
			"serverSheed": await helper.SHA256(serverSheed),
			"roundStartTime": moment().format("hh:mm:ss"),
			"spinTime": "",
			"nounce": "",
			"gameHash": "",
			"numericHash": "",
			"stopNoTime": "",
			"wheelStopTime": "",
			"revealedServerSheed": "",
			"stopNoRoulette": "",
			"status": "active"
		}

		guestManagment[guestId] = {	
			id: guestId,
			name: await helper.guestPlayer(),
			clientSheed: "",
			socketId: "",
			status: "1",
			wallate: wallate,
			guestProvablyFair: provably,
			gameMaster: {},
			gameHistory: [],
			lastGame: {},
			firework : {
				fire: 'firework4.gif'			
			}
		}
		return guestManagment[guestId];
	}
	return module;
}

function generatePassword(length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz#$%^&@';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}
function isAlphaNumeric(str) {
	var code, i, len;

	for (i = 0, len = str.length; i < len; i++) {
		code = str.charCodeAt(i);
		if (!(code > 47 && code < 58) && // numeric (0-9)
			!(code > 64 && code < 91) && // upper alpha (A-Z)
			!(code > 96 && code < 123)) { // lower alpha (a-z)
			return false;
		}
	}
	return true;
};
