var dateformat = require('dateformat');
module.exports = function(model,config){
	
	var module = {};

	module.view = async function(req, res){
		// console.log('req.session -->',req.session);
		// console.log('req.session.guest -->',req.session.guest);		
		var Guest = guestCount;
		console.log('Guest ->', Guest);
		var userCount = await model.User.count({where:{type:'user',is_deleted:'0'}});				
		var rouletteCount = await model.LightingRoulette.count({where:{is_deleted:'0',game_status:'completed'}});								

		//var [totalUsers,totalCoinflip,totalBlackJack,totalRoulette] = await Promise.all([userCount,coinflipCount,blackjackCount,rouletteCount]);

		res.render('backend/dashboard', {
			error: req.flash("error"),
			success: req.flash("success"),
			vErrors: req.flash("vErrors"),
			auth: req.session,
			config: config,
			totalUsers: userCount,			
			totalRoulette: rouletteCount,			
			title: process.env.siteName,
			Guest : Guest,
			alias: 'dashboard'
		});
	};

	return module;
}
