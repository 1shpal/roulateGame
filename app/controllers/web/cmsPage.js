var Op = Sequelize.Op;
var dateformat = require('dateformat');
const session = require('express-session');
var currentDate = new Date();

module.exports = function (model, config) {
	var module = {};

	module.provablyFair = async function (req, res) {
		try {
			var pageDetails = await model.Cms.findOne({ where: { title: 'Provably Fair' } }).then(descDetails => {
				return descDetails;
			});
			var user = ''
			if(req.session.user){
				user = await model.User.findOne({ where : {id : req.session.user.id}, raw : true })
				// console.log('user -->', user);	
			}
			var firworks = await model.Fireworks_master.findAll({ raw : true });

			let index = 1;
			if (req.params) {
				if (req.params.index) {
					index = 3
				}
			}

			res.render('frontend/provablyfair', {
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				alias: 'provably-fair',
				subAlias: 'CMS',
				title: process.env.siteName + ' | Provably Fair',
				detail: pageDetails,
				index: index,
				firworks : firworks,
				user : user,
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when Provably Fair page view: ", error);
			res.redirect('/');
		}
	};
	module.firework = async function(req, res){
		try{
			var fireDataUpdt = await model.User.update({firework : req.body.fire}, {where : {id : req.session.user.id}})
			if(fireDataUpdt){
				req.flash('success', "Successfully select firework.");
				return res.redirect('/provably-fair');	
			}else{
				req.flash('error', 'Canit update firework');
				return res.redirect('/provably-fair');
			}

		}catch(error){
			console.log("Error when firework submit : ", error);
			req.flash('error', 'Something went wrong');
			return res.redirect('/provably-fair');
		}
	};
	module.fireworkGuest = async function(req, res){
		try{
			if(!req.session.guest || !req.session.guest.id){
                req.flash('error', 'Guest player not found.');
				return res.redirect('/provably-fair');
			}
			let guestId = req.session.guest.id;
            guestManagment[guestId].firework.fire = req.body.fire;
			req.session.guest.firework.fire = req.body.fire;
			
			console.log('change firework -->',guestManagment[guestId].firework.fire);
			
			req.flash('success', "Successfully select firework.");
			return res.redirect('/provably-fair');	
		}catch(error){
			console.log("Error when fireworkGuest submit : ", error);
			req.flash('error', 'Something went wrong');
			return res.redirect('/provably-fair');
		}
	};
	module.aboutUs = async function (req, res) {
		try {
			var pageDetails = await model.Cms.findOne({ where: { title: 'About Us' } }).then(pageRes => {
				return pageRes;
			});
			console.log('req.session.guest.firework -->', req.session.guest.firework);
			//console.log('--------------',pageDetails);
			res.render('frontend/aboutUs', {
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				alias: 'about-us',
				subAlias: 'CMS',
				title: process.env.siteName + ' | About Us',
				detail: pageDetails,
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when Provably Fair page view: ", error);
			return res.redirect('/');
		}
	};
	module.termandCondition = async function (req, res) {
		try {
			var pageDetails = await model.Cms.findOne({ where: { title: 'Terms And Condition' } }).then(pageRes => {
				return pageRes;
			});
			res.render('frontend/termandCondition', {
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				alias: 'term-and-condition',
				subAlias: 'CMS',
				title: process.env.siteName + ' | Terms & Condition',
				detail: pageDetails,
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when Terms & condition page view: ", error);
			return res.redirect('/');
		}
	};
	module.help = async function (req, res) {
		try {
			var pageDetails = await model.Cms.findOne({ where: { title: 'Help' } }).then(pageRes => {
				return pageRes;
			});
			res.render('frontend/helpPage', {
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				alias: 'help',
				subAlias: 'CMS',
				title: process.env.siteName + ' | Help',
				detail: pageDetails,
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when help page view: ", error);
			return res.redirect('/');
		}
	};
	module.faq = async function (req, res) {
		try {
			var pageDetails = await model.Cms.findOne({ where: { title: 'FAQ' } }).then(pageRes => {
				return pageRes;
			});
			res.render('frontend/faqPage', {
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				alias: 'faq-page',
				subAlias: 'CMS',
				title: process.env.siteName + ' | FAQ',
				detail: pageDetails,
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when FAQ page view: ", error);
			return res.redirect('/');
		}
	};

	module.blogPages = async (req, res) => {
		let title = req.params.title;
		if (!title) {
			return res.redirect('/');
		}
		let getContent = await model.Cms.findOne({ where: { "title": title } });
		if (!getContent) {
			req.flash("error", "Blog detail not found!");
			return res.redirect('/');
		}

		res.render('frontend/blogCMS', {
			error: req.flash("error"),
			success: req.flash("success"),
			vErrors: req.flash("vErrors"),
			auth: req.session,
			config: config,
			alias: 'blogs',
			subAlias: 'CMS',
			title: process.env.siteName + ' | ' + getContent.title,
			getContent: getContent,
			getCMS: store.get("showCms")
		});
	}
	return module;
}