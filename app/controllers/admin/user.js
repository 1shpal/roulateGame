var dateformat = require('dateformat');
var currentDate = new Date();
var md5 = require('md5');
var Op = Sequelize.Op;
var  DeviceDetector = require("device-detector-js");
const e = require('connect-flash');

module.exports = function (model, config) {
	var module = {};

	module.view = function (request, response) {
		response.render('backend/user/users', {
			title: 'User List',
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			auth: request.session,
			config: config,
			title: process.env.siteName,
			alias: 'user'
		});
	};

	module.getUsers = async function (request, response) {
		var start = parseInt(request.query.start);
		var length = parseInt(request.query.length);
		var search = request.query.search.value;
		var query = {};	

		if (search != '') {
			query = {
				[Op.or]: [
					{ 'name': { [Op.like]: '%' + search + '%' } },
					{ 'email_id': { [Op.like]: '%' + search + '%' } }
				], type: 'user', 'is_deleted': '0'
			};
		} else {
			query = { type: "user", "is_deleted": "0" };
		}
		
		let column = request.query.order[0].column;
		let columns = request.query.columns[column].data;

		let sortType = 'asc';
		if (request.query.order[0].dir == 'desc') {
			sortType = 'desc';
		}
		var usersCount = await model.User.count({ where: query });

		var users = await model.User.findAll({ where: query, order: [[columns, sortType]], offset: start, limit: length, raw: true });
		// console.log('users -->', users);
		var userDeails = []
		for(let i = 0; i < users.length; i++){
			var walletData = await model.UserWalletMaster.findAll({ where: { user_id : users[i].id }  , raw: true })
			let details = {
				id : users[i].id,
				created_at : users[i].created_at,
				name : users[i].name,
				email_id : users[i].email_id,
				ipAddress : users[i].ipAddress,
				btc : walletData[0] && walletData[0].currency_id == 1 ? walletData[0].main_balance : 0.00000000,
				eth : walletData[1] && walletData[1].currency_id == 2 ? walletData[1].main_balance : 0.00000000,
				ltc : walletData[2] && walletData[2].currency_id == 3 ? walletData[2].main_balance : 0.00000000,
				doge : walletData[3] && walletData[3].currency_id == 4 ? walletData[3].main_balance : 0.00000000,
				roul1 : walletData[4] && walletData[4].currency_id == 5 ? walletData[4].main_balance : 0.00000000,
				device : users[i].device,
				profile_image : users[i].profile_image,
				status : users[i].status,
				lastLogin : users[i].lastLogin,
			}
			 
			userDeails.push(details)
		}
		// console.log('userDeails --->', userDeails);

		var obj = {
			'draw': request.query.draw,
			'recordsTotal': usersCount,
			'recordsFiltered': usersCount,
			'perPage': request.query.length,
			'data': userDeails
		};

		return response.send(JSON.stringify(obj));
	};

	module.add = function (request, response) {

		response.render('backend/user/add', {
			title: 'Add User',
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			auth: request.session,
			title: process.env.siteName,
			config: config
		});
	};

	module.save = async function (request, response) {

		let inputUserData = {
			name: request.body.name,
			email_id: request.body.email,
			password: md5(request.body.password),
			role: 'user'
		};
		try {
			var imageName = "";
			if (request.files.image) {
				var profile_image = request.files.image;

				var tempNum = randomNumber(4);
				var datetime = dateformat(currentDate, 'yyyymmddHHMMss');
				var imageName = datetime + tempNum + ".jpg";

				profile_image.mv('./public/frontend/upload/user/' + imageName, function (err) {
					// console.log('register image upload err: ', err);
				});
			} else {
				request.flash('error', "User image is required.");
				response.redirect('/backend/user');
			}

			if (imageName != "") {
				inputUserData.profile_image = imageName;
			}
			var userData = await model.User.create(inputUserData);
			if (userData != null) {
				request.flash('success', "User add successfully");
				response.redirect('/backend/user');
			} else {
				request.flash('error', "User detail not save.");
				response.redirect('/backend/user');
			}

		} catch (err) {
			request.flash('error', "User detail not save.");
			response.redirect('/backend/user');
		}
	};

	module.checkDuplicate = async function (request, response) {

		var email = request.body.email;
		var condition = { 'email_id': email, 'is_deleted': "0" };
		if (request.body.id) {
			condition.id = { [Op.ne]: request.body.id };
		}
		// console.log("condition: ", condition);
		var userDetail = await model.User.findOne({ where: condition });

		if (userDetail) {
			response.send("false");
		} else {
			response.send("true");
		}
	};

	module.edit = async function (request, response) {
		var userId = request.params.id;
		if (userId != "" && userId != 0) {
			try {
				var userDetail = await model.User.findOne({ where: { "id": userId } });
				if (userDetail != null) {
					response.render('backend/user/edit', {
						title: 'Edit User',
						error: request.flash("error"),
						success: request.flash("success"),
						vErrors: request.flash("vErrors"),
						auth: request.session,
						config: config,
						user: userDetail,
						title: process.env.siteName,
						alias: 'user'
					});
				} else {
					request.flash('error', "User detail not available.");
					response.redirect('/backend/user');
				}
			} catch (err) {
				request.flash('error', "User detail not available.");
				response.redirect('/backend/user');
			}
		} else {
			request.flash('error', "User detail not available.");
			response.redirect('/backend/user');
		}
	};

	module.update = async function (request, response) {
		var userId = request.params.id;
		if (userId != "" && userId != 0) {
			try {
				var userData = await model.User.findOne({ where: { "id": userId } });
				if (userData != null) {
					var status = '0';
					var is_login = '0';
					var user_chat_status = '0';
					var is_deposit = "0";
					var is_withdraw = "0";
					if (request.body.playpermission == 'true') {
						status = '1';
					}
					if (request.body.islogin == 'true') {
						is_login = '1';
					}
					if (request.body.user_can_chat == 'true') {
						user_chat_status = '1';
					}
					if (request.body.is_deposit == 'true') {
						is_deposit = '1';
					}
					if (request.body.is_withdraw == 'true') {
						is_withdraw = '1';
					}

					var inputData = {
						name: request.body.name,
						email_id: request.body.email,
						status: status,
						is_login: is_login,
						user_can_chat: user_chat_status,
						is_deposit: is_deposit,
						is_withdraw: is_withdraw,
						role: 'user'
					};
					var update_data = await userData.update(inputData);
					request.flash('success', "User detail update successfully.");
					response.redirect('/backend/user');
				} else {
					request.flash('error', "User detail not update.");
					response.redirect('/backend/user');
				}
			} catch (err) {
				request.flash('error', "User detail not update.");
				response.redirect('/backend/user');
			}
		} else {
			request.flash('error', "User detail not update.");
			response.redirect('/backend/user');
		}
	};

	module.delete = async function (request, response) {
		var userId = request.params.id;
		if (userId != "" && userId != 0) {
			try {
				var userData = await model.User.update({ "is_deleted": "1", "status": "0" }, { where: { id: userId } });
				request.flash('success', "User delete successfully.");
				response.redirect('/backend/user');
			} catch (err) {
				console.log("delete error: ", err);
				request.flash('error', "User not delete.");
				response.redirect('/backend/user');
			}
		} else {
			request.flash('error', "User not delete.");
			response.redirect('/backend/user');
		}
	};

	return module;
}

function randomNumber(length) {
	var chars = '0123456789';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}
