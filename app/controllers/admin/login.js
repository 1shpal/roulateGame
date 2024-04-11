var numeral = require('numeral');
var bcrypt = require('bcrypt-nodejs');
var dateFormat = require('dateformat');
var md5 = require('md5');
const { check, validationResult } = require('express-validator/check');
var nodemailer = require('nodemailer');
var smtpTransport = require("nodemailer-smtp-transport");
module.exports = function (model, config) {

	var module = {};

	module.signin = function (request, response) {

		var emailId = "";
		var password = "";
		if (request.cookies.admin_login_detail != null && request.cookies.admin_login_detail != undefined) {
			var emailId = request.cookies.admin_login_detail.email_id;
			var password = request.cookies.admin_login_detail.password;
		}

		response.render('backend/auth/login', {
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			session: request.session,
			config: config,
			emailId: emailId,
			password: password,
			title: process.env.siteName,
		});
	};

	module.signinCheck = async function (request, response) {

		var emailId = request.body.email;
		console.log(emailId);
		var password = md5(request.body.password);
		console.log(request.body.password);
		try {
			var userDetail = await model.User.findOne({ where: { 'email_id': emailId, 'password': password, 'type': 'admin' } }).then(result => {
				console.log('response.cookie -->',response.cookie);
				if (request.body.remember) {
					response.cookie('admin_login_detail', { 'email_id': emailId, 'password': request.body.password });
				} else {
					response.clearCookie('admin_login_detail');
				}

				request.session.admin = result;
				return result;
			}).catch(function (err) {
				console.log("login error: ", err);
				request.flash('error', "Email-id or password invalid");
				return request.redirect('/backend');
			});

			if (userDetail != null && userDetail != undefined) {
				request.flash('success', "Login successfully");
				return response.redirect('/backend/dashboard');
			} else {
				request.flash('error', "Email-id or password invalid");
				return response.redirect('/backend');
			}
		} catch (err) {
			request.flash('error', "Email-id or password invalid");
			return response.redirect('/backend');
		}
	};

	module.logout = function (request, response) {

		delete request.session.admin;

		request.flash('success', "Logout successfully");
		response.redirect('/backend');

	};

	module.forget = function (request, response) {
		response.render('backend/auth/forget', {
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			session: request.session,
			title: process.env.siteName,
			config: config
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

					var mailOptions = {
						from: process.env.supportEmail,
						to: emailId,
						subject: process.env.siteName + ': Forgot Password',
						html: '<p>Hello ' + userDetail.name + ',<br><br>Your new password is: <b>' + newPassword + ' </b></p>'
					};

					var send = await transporter.sendMail(mailOptions);

					if (send) {
						var userUpdate = await userDetail.update({ 'password': md5(newPassword) });
						request.flash('success', "New Password sent on your registered email address");
						return response.redirect('/backend');
					} else {
						request.flash('error', "Somthing wrong, please try again.");
						return response.redirect('/login/forget');
					}
				} else {
					request.flash('error', "Email-id is wrong.");
					return response.redirect('/login/forget');
				}
			} else {
				request.flash('error', "Please enter email-id.");
				return response.redirect('/login/forget');
			}
		} catch (err) {
			console.log("forgot password: ", err);
			request.flash('error', "Email-id is wrong.");
			return response.redirect('/login/forget');
		}
	};

	module.changePassword = function (request, response) {
		response.render('backend/auth/changepassword', {
			title: "Change Password",
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			auth: request.session,
			title: process.env.siteName,
			config: config
		});
	};

	module.changepasswordPost = async function (request, response) {
		var emailId = request.session.admin.email_id;
		var oldpassword = md5(request.body.oldpassword);
		var newpassword = md5(request.body.newpassword);

		try {
			var userDetail = await model.User.findOne({ where: { 'email_id': emailId, 'password': oldpassword } });
			if (userDetail != null) {
				var updateData = await userDetail.update({ password: newpassword });
				request.flash('success', "Password change successfully.");
				return response.redirect('/backend/dashboard');
			} else {
				request.flash('error', "Old password is wrong");
				return response.redirect('/backend/changepassword');
			}
		} catch (err) {
			console.log("Password change error: ", err);
			request.flash('error', "Password not change, please try again");
			return response.redirect('/backend/changepassword');
		}
	};
	return module;
}


function generatePassword(length) {
	var chars = '0123456789abcdefghijklmnopqrstuvwxyz#$%^&@';
	var result = '';
	for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}