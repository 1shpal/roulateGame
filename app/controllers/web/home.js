module.exports = function (model, config) {
	var module = {};

	module.view = async function (req, res) {
		try {

			var bannerData = await model.BannerMaster.findAll({ where: { 'is_active': '1' } });

			var authBannerData = await model.BannerMaster.findOne({ where: { 'is_login_image': '1' } });

			if (authBannerData == null) {
				authBannerData = {
					title: "Lorem Ipsum",
					banner_image: "login-popup-bg.png",
					description: "is simply dummy text of <br> the printing and",
				}
			}

			//console.log("login details  banner:",authBannerData);

			res.render('frontend/home', {
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				bannerData: bannerData,
				loginBanner: authBannerData,
				alias: 'game',
				subAlias: 'home',
				title: process.env.siteName + ' | Home',
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when home page loading: ", error);
			req.flash('error', "bitroul under maintenance, please after some times.");
			res.redirect('/');
		}
	};

	return module;
}