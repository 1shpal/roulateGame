var dateformat = require('dateformat');
var currentDate = new Date();
var md5 = require('md5');
var Op = Sequelize.Op;

module.exports = function (model, config) {
	var module = {};

	module.view = function (request, response) {
		response.render('backend/deposite/deposites', {
			title: 'Deposit List',
			error: request.flash("error"),
			success: request.flash("success"),
			vErrors: request.flash("vErrors"),
			auth: request.session,
			config: config,
			title: process.env.siteName,
			alias: 'deposite'
		});
	};

	module.getDeposites = async function (request, response) {

		var start = parseInt(request.query.start);
		var length = parseInt(request.query.length);
		var search = request.query.search.value;
		var query = {};

		if (search != '') {
			query = {
				[Op.or]: [
					{ 'depositCoin': { [Op.like]: '%' + search + '%' } },
					{ 'coin_type': { [Op.like]: '%' + search + '%' } },
					{ 'transaction_id': { [Op.like]: '%' + search + '%' } },
					{ 'transaction_address': { [Op.like]: '%' + search + '%' } },
					{ 'status': { [Op.like]: '%' + search + '%' } },
					{ '$userDetail.name$': { [Op.like]: '%' + search + '%' } },

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


		//console.log("query: ", query);
		var depositesCount = await model.Deposit.count({ where: query, include: [{ model: model.User, attributes: ['id', 'name'], raw: true, as: 'userDetail' }] });
		//console.log('depositesCount----', depositesCount);
		var deposites = await model.Deposit.findAll({
			where: query,
			include: [{ model: model.User, attributes: ['id', 'name'], raw: true, as: 'userDetail' }],
			order: [[columns, sortType]],
			offset: start,
			limit: length,
			raw: true
		});
		//console.log('deposites----', deposites);	    
		var obj = {
			'draw': request.query.draw,
			'recordsTotal': depositesCount,
			'recordsFiltered': depositesCount,
			'perPage': length,
			'data': deposites
		};

		return response.send(JSON.stringify(obj));
	};

	return module;
}