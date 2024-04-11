const Op = Sequelize.Op;
const session = require("express-session");
const IP = require("ip");
module.exports = function (model, config) {
	var module = {};
	module.view = async function (req, res) {
		try {

			let wallate = {
				UserWalletdata: UserWalletdata,
				currencyDetails: currencyDetails
			};
			var gameDetail = {};
			if (req.session.user) {
				var userId = req.session.user.id;
				if (userId != "" && userId != 0 && userId != null && userId != undefined) {

					gameDetail = await model.LightingRoulette.findOne({ where: { "playerId": userId, game_status: { [Op.not]: ['completed'] } }, include: [{ model: model.LightingRouletteHistory, as: 'rouletteHistory' }] });

					var UserWalletdata = await model.UserWalletMaster.findOne({ where: { 'user_id': req.session.user.id, 'is_selected': true } });
					var currencyDetails = '';
					if (UserWalletdata != undefined) {
						currencyDetails = await model.CurrencyMaster.findOne({ where: { 'id': UserWalletdata.currency_id } });
					}
					wallate.UserWalletdata = UserWalletdata;
					wallate.currencyDetails = currencyDetails;
				}
			} else {
				if (req.session.guest) {
					if (req.session.guest.id) {
						if (!guestManagment[req.session.guest.id]) {
							guestManagment[req.session.guest.id] = req.session.guest;
						} else {
							req.session.guest = guestManagment[req.session.guest.id];
							wallate = guestManagment[req.session.guest.id].wallate;
							gameDetail = guestManagment[req.session.guest.id].gameMaster;
						}
					}
				}
			}

			if(SettingMaster){
				var settings = {
					landingHeaderTxt: SettingMaster.landingHeaderTxt,
					landingBodyTxt: SettingMaster.landingBodyTxt
				}
			}		
			var user = ''
			if(req.session.user){
				user = await model.User.findOne({ where : { id : req.session.user.id }, raw : true })
			}else{
				console.log('no use found in session');
			}
			
			res.render('frontend/lighting_roulette', {
				info: req.flash("info"),
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				games: gameDetail,
				alias: 'game',
				subAlias: 'lighting-roulette',
				title: process.env.siteName + ' | NoZero Roulette',
				wallate: wallate,
				user : user,
				settings: settings,
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when black-jack page loading: ", error);
			req.flash('error', 'Please login');
			return res.redirect('/');

		}
	};
	module.viewHistory = async function (req, res) {
		try {
			res.render('frontend/bet_history', {
				info: req.flash("info"),
				error: req.flash("error"),
				success: req.flash("success"),
				vErrors: req.flash("vErrors"),
				auth: req.session,
				config: config,
				alias: 'history',
				subAlias: 'history',
				title: process.env.siteName + ' | History',
				getCMS: store.get("showCms")
			});
		} catch (error) {
			console.log("Error when black-jack page loading: ", error);
			req.flash('error', 'Please login');
			return res.redirect('/');
		}
	}
	module.getHisotydata = async function (req, res) {

		var start = parseInt(req.query.start);
		var length = parseInt(req.query.length);
		var search = req.query.search.value;
		var query = {};

		if (search != '') {
			query = {
				[Op.or]: [
					{ 'game_number': { [Op.like]: '%' + search + '%' } },
					{ 'bet_amount': { [Op.like]: '%' + search + '%' } },
					{ 'stopped_on_number': { [Op.like]: '%' + search + '%' } },
					{ 'totalWinAmountShow': { [Op.like]: '%' + search + '%' } },
				], 'game_status': "completed", "playerId": req.session.user.id, isBeyond: "0",
			};
		} else {
			query = { 'game_status': "completed", "playerId": req.session.user.id, isBeyond: "0" };
		}
		let column = req.query.order[0].column;
		let columns = req.query.columns[column].data;

		let sortType = 'DESC';
		if (req.query.order[0].dir == 'asc') {
			sortType = 'asc';
		}
		// console.log("columns", columns);
		let gameCnt = await model.LightingRoulette.count({ where: query });
		let gameData = await model.LightingRoulette.findAll({
			where: query,
			include: [{ model: model.CurrencyMaster, "as": "currencyDetails", raw: true }],
			attributes: ['id', 'game_number', 'game_hash', 'stopped_on_number', 'bet_amount', 'game_status', 'winning_amount', 'created_at', "admin_commission", "admin_commission_price", "totalWinAmountShow"],
			order: [[columns, sortType]],
			offset: start,
			limit: length,
			raw: true
		});

		var obj = {
			'draw': req.query.draw,
			'recordsTotal': gameCnt,
			'recordsFiltered': gameCnt,
			'perPage': req.query.length,
			'data': gameData
		};

		return res.send(JSON.stringify(obj));

	}
	module.betHistory = async function (req, res) {
		var gameId = req.params.id;
		var start = parseInt(req.query.start);
		var length = parseInt(req.query.length);
		var search = req.query.search.value;
		var query = {};

		if (search != '') {
			query = {
				[Op.or]: [
					{ 'selectedNumber': { [Op.like]: '%' + search + '%' } },
					{ 'bet_amount': { [Op.like]: '%' + search + '%' } },
					{ 'is_won': { [Op.like]: '%' + search + '%' } },
					{ 'winning_amount': { [Op.like]: '%' + search + '%' } },
				], "user_id": req.session.user.id, "game_id": gameId
			};
		} else {
			query = { "user_id": req.session.user.id, "game_id": gameId };
		}
		// let column = req.query.order[0].column;
		// let columns = req.query.columns[column].data;

		// let sortType = 'asc';
		// if (req.query.order[0].dir == 'desc') {
		// 	sortType = 'desc';
		// }		

		let gameCnt = await model.LightingRouletteHistory.count({ where: query });
		let gameData = await model.LightingRouletteHistory.findAll({
			where: query,
			// order: [[columns, sortType]],			
			raw: true
		});


		let gameDetail = await model.LightingRoulette.findOne({ where: { "id": gameId } });
		let chispAmount = 0;
		if (gameDetail) {
			chispAmount = gameDetail.currencyRate
		}
		var obj = {
			'draw': req.query.draw,
			'recordsTotal': gameCnt,
			'recordsFiltered': gameCnt,
			'perPage': req.query.length,
			'data': gameData,
			"chispAmount": chispAmount
		};

		return res.send(JSON.stringify(obj));
	}
	return module;
}