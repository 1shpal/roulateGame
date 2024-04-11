var dateformat = require('dateformat');
var currentDate = new Date();
var Op = Sequelize.Op;

module.exports = function (model, config) {
	var module = {};

	module.view = function (request, response) {
		response.render('backend/light-roulette/list', {
			title: 'Lighting Roulette List',
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			auth: request.session,
			config: config,
			title: process.env.siteName,
			alias: 'light_roulette'
		});
	};

	module.getRoulette = async function (request, response) {

		var start = parseInt(request.query.start);
		var length = parseInt(request.query.length);
		var search = request.query.search.value;
		var query = { "is_deleted": "0", "game_status": "completed", isBeyond: "0" };
		if (search != '') {
			query = {
				[Op.or]: [
					{ 'game_number': { [Op.like]: '%' + search + '%' } },
					{ 'stopped_on_number': { [Op.like]: '%' + search + '%' } },
					{ 'bet_amount': { [Op.like]: '%' + search + '%' } },
					{ 'game_status': { [Op.like]: '%' + search + '%' } },
					{ '$playerDetails.name$': { [Op.like]: '%' + search + '%' } },
				], "is_deleted": "0", "game_status": "completed", isBeyond: "0"
			};
		}
		if (parseInt(request.query.is_datefilter) == 1) {
			let start_date = new Date(request.query.start_date)
			let end_date = new Date(request.query.end_date)
			end_date.setUTCHours(23, 59, 59, 999);
			query.created_at = { [Op.gte]: start_date, [Op.lte]: end_date }
		} else {
			let start_date = new Date(request.query.start_date);
			let end_date = new Date(request.query.end_date);
			end_date.setUTCHours(23, 59, 59, 999);
			query.created_at = { [Op.gte]: start_date, [Op.lte]: end_date }
		}
		let column = request.query.order[0].column;
		let columns = request.query.columns[column].data;
		let sortType = 'desc';
		if (request.query.order[0].dir == 'asc') {
			sortType = 'asc';
		}
		let sortArr = [[columns, sortType]]
		if (columns == "name") {
			sortArr = [["playerDetails", columns, sortType]] // Here playerDetails is Aliase
		}
		var rouletteCount = await model.LightingRoulette.count({
			where: query, include: [
				{ model: model.User, attributes: ['id', 'name'], raw: true, as: 'playerDetails' }]
		});

		let roulette = await model.LightingRoulette.findAll({
			where: query,
			include: [
				{ model: model.User, attributes: ['id', 'name'], raw: true, as: 'playerDetails' },
				{ model: model.CurrencyMaster, raw: true, as: "currencyDetails" }
			],
			order: sortArr,
			offset: start,
			limit: length,
			raw: true
		});

		var obj = {
			'draw': request.query.draw,
			'recordsTotal': rouletteCount,
			'recordsFiltered': rouletteCount,
			'perPage': request.query.length,
			'data': roulette
		};

		return response.send(JSON.stringify(obj));
	};

	module.detail = async function (request, response) {
		var rouletteId = request.params.id;
		//console.log("rouletteId----", rouletteId);
		if (rouletteId != "" && rouletteId != 0) {
			let gameMaster = await model.LightingRoulette.findOne({
				where: {
					'id': rouletteId
				},
				include: [
					{ model: model.User, attributes: ['id', 'name'], raw: true, as: 'playerDetails' }],
			});
			if (!gameMaster) {
				request.flash('error', "Game detail not available.");
				return response.redirect('/backend/light_roulette');
			}
			let IsExit = await model.LightingRouletteHistory.count({
				where: {
					'game_id': gameMaster.id
				}
			});
			// console.log("IsExit", IsExit);
			if (IsExit <= 0) {
				request.flash('error', "Game history detail not available.");
				return response.redirect('/backend/light_roulette');
			}
			let netWinAmout = parseFloat(parseFloat(parseFloat(gameMaster.winning_amount) - parseFloat(gameMaster.admin_commission_price)) * parseFloat(gameMaster.currencyRate)).toFixed(8)

			gameMaster.winning_amount = parseFloat(parseFloat(gameMaster.winning_amount) * parseFloat(gameMaster.currencyRate)).toFixed(8)
			gameMaster.admin_commission_price = parseFloat(parseFloat(gameMaster.admin_commission_price) * parseFloat(gameMaster.currencyRate)).toFixed(8)
			response.render('backend/light-roulette/detail', {
				title: 'Roulette Detail',
				error: request.flash("error"),
				success: request.flash("success"),
				vErrors: request.flash("vErrors"),
				auth: request.session,
				config: config,
				game: gameMaster,
				netWinAmout: netWinAmout,
				title: process.env.siteName,
				alias: 'light_roulette'
			});
		} else {
			request.flash('error', "Game detail not available.");
			return response.redirect('/backend/light_roulette');
		}
	};

	module.detailHisoty = async function (request, response) {
		var historyId = request.params.id;
		if (!historyId) {
			request.flash('error', "Game history detail not found.");
			return response.redirect('/backend/light_roulette');
		}

		var start = parseInt(request.query.start);
		var length = parseInt(request.query.length);
		var search = request.query.search.value;
		var query = { "game_id": historyId };
		if (search != '') {
			query = {
				[Op.or]: [
					{ 'bet_amount': { [Op.like]: '%' + search + '%' } },
					{ 'selectedNumber': { [Op.like]: '%' + search + '%' } },
					{ 'winning_amount': { [Op.like]: '%' + search + '%' } },
					{ 'is_won': { [Op.like]: '%' + search + '%' } }
				], "game_id": historyId
			};
		}


		let column = request.query.order[0].column;
		let columns = request.query.columns[column].data;

		let sortType = 'asc';
		if (request.query.order[0].dir == 'desc') {
			sortType = 'desc';
		}

		var getHisotyCnt = await model.LightingRouletteHistory.count({ where: query });
		var getHisoty = await model.LightingRouletteHistory.findAll({
			where: query,
			// include: [
			// 	{ model: model.LightingRoulette, as: "rouletteDetail" },
			// 	{ model: model.User, as: "userDetail", attributes: ["id", "name"] },
			// ],
			order: [[columns, sortType]],
			offset: start,
			limit: length,
			raw: true
		});
		var obj = {
			'draw': request.query.draw,
			'recordsTotal': getHisotyCnt,
			'recordsFiltered': getHisotyCnt,
			'perPage': request.query.length,
			'data': getHisoty
		};

		return response.send(JSON.stringify(obj));
	}

	module.delete = async function (request, response) {
		var rouletteId = request.params.id;
		if (rouletteId != "" && rouletteId != 0) {
			try {
				var gameData = await model.LightingRoulette.update({ "is_deleted": "1" }, { where: { id: rouletteId } });
				request.flash('success', "Game deleted successfully.");
				response.redirect('/backend/light_roulette');
			} catch (err) {
				console.log("delete error: ", err);
				request.flash('error', "Game not deleted.");
				response.redirect('/backend/light_roulette');
			}
		} else {
			request.flash('error', "Game not deleted.");
			response.redirect('/backend/light_roulette');
		}
	};

	return module;
}