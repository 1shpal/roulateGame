var dateformat = require('dateformat');
var currentDate = new Date();
var Op = Sequelize.Op;

module.exports = function (model, config) {
	var module = {};

	module.view = async function (request, response) {
		var settingDetail = await model.Setting.findOne();

		response.render('backend/setting', {
			title: 'Setting',
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			auth: request.session,
			config: config,
			alias: 'setting',
			subAlias: 'setting',
			title: process.env.siteName,
			setting: settingDetail,
		});
	};

	module.update = async function (request, response) {
		if(request.body.landingHeaderTxt){
			request.body.landingHeaderTxt = request.body.landingHeaderTxt.replace(/ /g, '&nbsp');
		}
		if(request.body.landingHeaderTxt){
			request.body.landingBodyTxt = request.body.landingBodyTxt.replace(/ /g, '&nbsp');
		}
		var inputData = {
			roulette_commission: request.body.roulette_commission,
			facebook_link: request.body.facebook_link,
			twitter_link: request.body.twitter_link,
			steam_link: request.body.steam_link,
			maximumBetLimit: request.body.maximumBetLimit,
			landingHeaderTxt: request.body.landingHeaderTxt,
			landingBodyTxt: request.body.landingBodyTxt
		};
		try {

			var setting = await model.Setting.findOne({ where: { "id": "1" } });
			var settingData = await setting.update(inputData);

			if (settingData != null) {
				setting = await model.Setting.findOne({});
				SettingMaster = setting;
				request.flash('success', "Setting update successfully");
				response.redirect('/backend/setting');
			} else {
				request.flash('error', "Setting detail not update.");
				response.redirect('/backend/setting');
			}

		} catch (err) {
			request.flash('error', "Setting detail not update.");
			response.redirect('/backend/setting');
		}
	};
	return module;
}