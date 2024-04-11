var dateformat = require('dateformat');
var currentDate = new Date();
var md5 = require('md5');
var Op = Sequelize.Op;

module.exports = function (model, config) {
	var module = {};

	module.view = function (request, response) {
		response.render('backend/withdraw/withdraws', {
			title: 'Withdraw List',
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			auth: request.session,
			config: config,
			title: process.env.siteName,
			alias: 'withdraw'
		});
	};

	module.getWithdraws = async function (request, response) {

		var start = parseInt(request.query.start);
		var length = parseInt(request.query.length);
		var search = request.query.search.value;
		var query = {};

		if (search != '') {
			query = {
				[Op.or]: [
					{ 'withdrawAmout': { [Op.like]: '%' + search + '%' } },
					{ 'coin_type': { [Op.like]: '%' + search + '%' } },
					{ 'transaction_id': { [Op.like]: '%' + search + '%' } },
					{ 'status': { [Op.like]: '%' + search + '%' } },
					{ '$userDetail.name$': { [Op.like]: '%' + search + '%' } }

				], 'is_deleted': '0'
			};
		} else {
			query = { 'is_deleted': "0" };
		}
		// console.log(request.query);
		let column = request.query.order[0].column;
		let columns = request.query.columns[column].data;

		let sortType = 'asc';
		if (request.query.order[0].dir == 'desc') {
			sortType = 'desc';
		}
		// console.log("query: ", query);
		var withdrawsCount = await model.Withdraw.count({
			where: query,
			include: [{ model: model.User, attributes: ['id', 'name'], raw: true, as: 'userDetail' }]
		});
		var withdraws = await model.Withdraw.findAll({
			include: [{ model: model.User, attributes: ['id', 'name'], raw: true, as: 'userDetail' }],
			where: query,
			order: [[columns, sortType]],
			offset: start,
			limit: length,
			raw: true
		});

		var obj = {
			'draw': request.query.draw,
			'recordsTotal': withdrawsCount,
			'recordsFiltered': withdrawsCount,
			'perPage': length,
			'data': withdraws
		};

		return response.send(JSON.stringify(obj));
	};

	return module;
}

